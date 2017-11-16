// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

var tt = require('./jstokentype').types
var Parser = require('./jsstate').Parser
var DestructuringErrors = require('./jsparseutil').DestructuringErrors

var pp = Parser.prototype

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp.checkPropClash = function(prop, propHash) {
	if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
		return
	var key = prop.key, name
	switch (key.type) {
		case "Identifier": name = key.name; break
		case "Literal": name = String(key.value); break
		default: return
	}
	var kind = prop.kind
	if (this.options.ecmaVersion >= 6) {
		if (name === "__proto__" && kind === "init") {
			if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property")
			propHash.proto = true
		}
		return
	}
	name = "$" + name
	var other = propHash[name]
	if (other) {
		var isGetSet = kind !== "init"
		if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
			this.raiseRecoverable(key.start, "Redefinition of property")
	} else {
		other = propHash[name] = {
			init: false,
			get: false,
			set: false
		}
	}
	other[kind] = true
}

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp.parseExpression = function(noIn, refDestructuringErrors) {
	var startPos = this.start
	var expr = this.parseMaybeAssign(noIn, refDestructuringErrors)

	if (this.type === tt.comma) {
		var node = this.startNodeAt(startPos)
		node.expressions = [expr]
		while (this.eat(tt.comma)){
			if(this.type === tt.parenR){
				this.unexpected()
			}
			node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors))
		}

		return this.finishNode(node, "SequenceExpression")
	}
	return expr
}

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
	if (this.inGenerator && this.isContextual("yield")) return this.parseYield()

	var ownDestructuringErrors = false
	if (!refDestructuringErrors) {
		refDestructuringErrors = new DestructuringErrors
		ownDestructuringErrors = true
	}
	var startPos = this.start
	if (this.type == tt.parenL || this.type == tt.name)
		this.potentialArrowAt = this.start

	var left = this.parseMaybeConditional(noIn, refDestructuringErrors)

	if (afterLeftParse) left = afterLeftParse.call(this, left, startPos)
	if (this.type.isAssign) {
		this.checkPatternErrors(refDestructuringErrors, true)
		if (!ownDestructuringErrors) DestructuringErrors.call(refDestructuringErrors)
		var node = this.startNodeAt(startPos)
		node.operator = this.value
		node.left = this.type === tt.eq ? this.toAssignable(left) : left
		refDestructuringErrors.shorthandAssign = 0 // reset because shorthand default was used correctly
		this.checkLVal(left)
		
		var type = this.type

		this.next()

		// ok we should store comments
		if(this.storeComments){
			this.commentAround(node, type)
		}

		node.right = this.parseMaybeAssign(noIn)
		return this.finishNode(node, "AssignmentExpression")
	} else {
		if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true)
	}
	return left
}

// Parse a ternary conditional (`?:`) operator.

pp.parseMaybeConditional = function(noIn, refDestructuringErrors) {

	var startPos = this.start
	var expr = this.parseExprOps(noIn, refDestructuringErrors)
	if (this.checkExpressionErrors(refDestructuringErrors)) return expr
	if (this.eat(tt.question)) {
		var node = this.startNodeAt(startPos)
		if(this.storeComments){
			var after = this.commentAfter(tt.question)
			if(after && after.length) node.afterq = after
		}
		node.test = expr
		node.consequent = this.parseMaybeAssign()
		this.expect(tt.colon)
		if(this.storeComments){
			var after = this.commentAfter(tt.colon)
			if(after && after.length) node.afterc = after
		}
		node.alternate = this.parseMaybeAssign(noIn)
		return this.finishNode(node, "ConditionalExpression")
	}

	return expr
}

// Start the precedence parser.

pp.parseExprOps = function(noIn, refDestructuringErrors) {
	var startPos = this.start
	var expr = this.parseMaybeUnary(refDestructuringErrors, false)
	if (this.checkExpressionErrors(refDestructuringErrors)) return expr
	return this.parseExprOp(expr, startPos, -1, noIn)
}

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp.parseExprOp = function(left, leftStartPos, minPrec, noIn) {
	var prec = this.type.binop
	if (prec != null && (!noIn || this.type !== tt._in)) {
		if (prec > minPrec) {
			var node = this.startNodeAt(leftStartPos)

			var logical = this.type === tt.logicalOR || this.type === tt.logicalAND
			node.operator = this.value

			node.left = left
			var type = this.type
			if(!this.skippedNewlines){
				node.leftSpace = this.skippedSpace
			}
			this.next()
			if(!this.skippedNewlines){
				node.rightSpace = this.skippedSpace
			}

			if(this.storeComments){
				this.commentAround(node, type)
			}
			
			node.right = this.parseExprOp(this.parseMaybeUnary(null, false), leftStartPos, prec, noIn)

			return this.parseExprOp(this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression"), leftStartPos, minPrec, noIn)
		}
	}
	return left
}

pp.buildBinary = function(startPos, left, right, op, logical) {
	var node = this.startNodeAt(startPos)
	node.left = left
	node.operator = op
	node.right = right
	return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
}

// Parse unary operators, both prefix and postfix.

pp.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
	var startPos = this.start, expr
	if (this.type.prefix) {
		var node = this.startNode()
		var update = this.type === tt.incDec

		node.operator = this.value
		node.prefix = true
		this.next()
		node.argument = this.parseMaybeUnary(null, true)
		this.checkExpressionErrors(refDestructuringErrors, true)
		if (update) this.checkLVal(node.argument)
		else if (this.strict && node.operator === "delete" &&
						 node.argument.type === "Identifier")
			this.raiseRecoverable(node.start, "Deleting local variable in strict mode")
		else sawUnary = true
		expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression")
	} else {
		expr = this.parseExprSubscripts(refDestructuringErrors)
		if (this.checkExpressionErrors(refDestructuringErrors)) return expr
		while (this.type.postfix && !this.canInsertSemicolon()) {
			var node = this.startNodeAt(startPos)
			node.operator = this.value
			node.prefix = false
			node.argument = expr
			this.checkLVal(expr)
			this.next()
			expr = this.finishNode(node, "UpdateExpression")
		}
	}

	if (!sawUnary && this.eat(tt.starstar))
		return this.buildBinary(startPos, expr, this.parseMaybeUnary(null, false), "**", false)
	else
		return expr
}

// Parse call, dot, and `[]`-subscript expressions.

pp.parseExprSubscripts = function(refDestructuringErrors) {
	var startPos = this.start
	var expr = this.parseExprAtom(refDestructuringErrors)
	var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")"
	if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr
	return this.parseSubscripts(expr, startPos)
}

pp.parseSubscripts = function(base, startPos, noCalls) {
	for (;;) {
		if (this.eat(tt.dot)) {
			var node = this.startNodeAt(startPos)
			if(this.storeComments){
				this.commentAround(node, tt.dot)
			}
			node.object = base
			node.property = this.parseIdent(true)
			node.computed = false
			base = this.finishNode(node, "MemberExpression")
		} else if (this.eat(tt.bracketL)) {
			var node = this.startNodeAt(startPos)
			node.object = base
			node.property = this.parseExpression()
			node.computed = true
			this.expect(tt.bracketR)
			if(this.storeComments){
				//!TODO if we want whitespace mode for [ ] , dont clear them
				this.commentClear(tt.bracketR)
			}
			base = this.finishNode(node, "MemberExpression")

		} else if (!noCalls && this.eat(tt.parenL)) {
			var node = this.startNodeAt(startPos)
			node.callee = base
			node.arguments = this.parseExprList(tt.parenR, false, false, false, node)
			if(this.skippedNewlines){
				node.rightSpace = this.skippedSpace
			}

			base = this.finishNode(node, "CallExpression")
		} else if (this.type === tt.backQuote) {
			var node = this.startNodeAt(startPos)
			node.tag = base
			node.quasi = this.parseTemplate()
			base = this.finishNode(node, "TaggedTemplateExpression")
		} else {
			return base
		}
	}
}

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp.parseExprAtom = function(refDestructuringErrors) {

	var node, canBeArrow = this.potentialArrowAt == this.start
	switch (this.type) {
	case tt._super:
		if (!this.inFunction)
			this.raise(this.start, "'super' outside of function or class")

	case tt._this:
		var type = this.type === tt._this ? "ThisExpression" : "Super"
		var node = this.startNode()
		this.next()
		return this.finishNode(node, type)

	case tt.name:
		var startPos = this.start
		var id = this.parseIdent(this.type !== tt.name)
		if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)){

			if(this.storeComments){
				var cmt = this.commentAfter(tt.arrow)
			}
			var node = this.parseArrowExpression(this.startNodeAt(startPos), [id])
			if(this.storeComments){
				node.between = cmt
			}
			node.noParens = 1
			return node
		}
		return id

	case tt.regexp:
		var value = this.value
		node = this.parseLiteral(value.value)
		node.regex = {pattern: value.pattern, flags: value.flags}
		return node

	case tt.num: case tt.string:

		return this.parseLiteral(this.value)

	case tt._null: case tt._true: case tt._false:
		node = this.startNode()
		node.value = this.type === tt._null ? null : this.type === tt._true
		node.raw = this.type.keyword
		node.kind = this.type === tt._null?'object':'boolean'
		this.next()
		return this.finishNode(node, "Literal")

	case tt.parenL:
		return this.parseParenAndDistinguishExpression(canBeArrow)

	case tt.bracketL:
		node = this.startNode()
		this.next()
		node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors, node)
		return this.finishNode(node, "ArrayExpression")

	case tt.braceL:
		return this.parseObj(false, refDestructuringErrors)

	case tt._function:
		node = this.startNode()
		if(this.input.charCodeAt(this.pos) === 32)node.space = ' ' 
		else node.space = ''
		this.next()
		return this.parseFunction(node, false)

	case tt._class:
		return this.parseClass(this.startNode(), false)

	case tt._new:
		return this.parseNew()

	case tt.backQuote:
		return this.parseTemplate()

	default:
		this.unexpected()
	}
}

pp.parseLiteral = function(value) {
	var node = this.startNode()
	node.value = value
	node.raw = this.input.slice(this.start, this.end)

	if(this.type === tt.num) node.kind = 'num'
 	else if(this.type === tt.string) node.kind = 'string'
	else if(this.type === tt.regexp) node.kind = 'regexp'

	this.next()
	return this.finishNode(node, "Literal")
}

pp.parseParenExpression = function(preserveParens) {
	this.expect(tt.parenL)
	var val = this.parseExpression()
	this.expect(tt.parenR)
	return val
}

pp.parseParenAndDistinguishExpression = function(canBeArrow) {
	var startPos = this.start,  val
	var top, bottom
	if (this.options.ecmaVersion >= 6) {

		this.next()

		if(this.storeComments){
			var top = this.commentTop()
		}

		var innerStartPos = this.start
		var exprList = []//, first = true
		var refDestructuringErrors = new DestructuringErrors, spreadStart, innerParenStart
		while (this.type !== tt.parenR) {

			if(this.storeComments){
				var above = this.commentBegin()
			}

			//first ? first = false : this.expect(tt.comma)
			if (this.type === tt.ellipsis) {
				spreadStart = this.start
				exprList.push(this.parseParenItem(this.parseRest()))
				break
			} else {
				if (this.type === tt.parenL && !innerParenStart) {
					innerParenStart = this.start
				}
				var expr = this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem)
				exprList.push(expr)
			}

			if(this.eat(tt.comma)){
				if(this.storeComments){
					this.commentEndSplit(expr, above, tt.parenR, tt.comma)
				}
				if(this.type === tt.parenR){
					this.unexpected()
				}
			}
			else if(this.type !== tt.parenR){
				this.unexpected()
			}
		}
		var innerEndPos = this.start

		if(this.storeComments){
			this.commentEnd(expr, above, tt.parenR)
		}

		this.expect(tt.parenR)

		if(this.storeComments){
			bottom = this.commentBottom(tt.parenR)
		}

		if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
			this.checkPatternErrors(refDestructuringErrors, true)
			if (innerParenStart) this.unexpected(innerParenStart)
			return this.parseParenArrowList(startPos, exprList)
		}

		if (!exprList.length) this.unexpected(this.lastTokStart)
		if (spreadStart) this.unexpected(spreadStart)
		this.checkExpressionErrors(refDestructuringErrors, true)

		if (exprList.length > 1) {
			val = this.startNodeAt(innerStartPos)
			val.expressions = exprList
			this.finishNodeAt(val, "SequenceExpression", innerEndPos)
		} else {
			val = exprList[0]
		}
	} else {
		val = this.parseParenExpression()
	}

	if (this.options.preserveParens) {
		var par = this.startNodeAt(startPos)
		par.expression = val
		if(this.skippedNewlines){
			par.rightSpace = this.skippedSpace
		}
		if(this.storeComments){
			if(top && top.length) par.top = top
			if(bottom && bottom.length) par.bottom = bottom

			// remove our paren otherwise the matcher goes wrong
			//if(this.storeComments[0] === tt.parenR){
			//	this.storeComments.shift()
			//}
		}
		return this.finishNode(par, "ParenthesizedExpression")
	} else {
		return val
	}
}

pp.parseParenItem = function(item) {
	return item
}

pp.parseParenArrowList = function(startPos, exprList) {
	return this.parseArrowExpression(this.startNodeAt(startPos), exprList)
}

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = []

pp.parseNew = function() {
	var node = this.startNode()
	// store newline after new?
	var meta = this.parseIdent(true)
	
	if(this.storeComments) this.commentAround(node, tt._new)
	
	if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
		node.meta = meta
		node.property = this.parseIdent(true)
		if (node.property.name !== "target")
			this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target")
		if (!this.inFunction)
			this.raiseRecoverable(node.start, "new.target can only be used in functions")
		return this.finishNode(node, "MetaProperty")
	}
	var startPos = this.start
	node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, true)
	if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, false,false,false, node)
	else node.arguments = empty
	return this.finishNode(node, "NewExpression")
}

// Parse template expression.

pp.parseTemplateElement = function() {
	var elem = this.startNode()
	elem.value = {
		raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
		cooked: this.value
	}
	this.next()
	elem.tail = this.type === tt.backQuote
	return this.finishNode(elem, "TemplateElement")
}

pp.parseTemplate = function() {
	var node = this.startNode()
	this.next()
	node.expressions = []
	var curElt = this.parseTemplateElement()
	node.quasis = [curElt]
	while (!curElt.tail) {
		this.expect(tt.dollarBraceL)
		node.expressions.push(this.parseExpression())
		this.expect(tt.braceR)
		node.quasis.push(curElt = this.parseTemplateElement())
	}
	this.next()
	return this.finishNode(node, "TemplateLiteral")
}

// Parse an object literal or binding pattern.

pp.parseObj = function(isPattern, refDestructuringErrors) {
	var node = this.startNode(), first = true, propHash = {}
	node.properties = []
	this.next()

	if(this.storeComments) this.commentTop(node)

	while (!this.eat(tt.braceR)) {

		if(this.storeComments){
			var above = this.commentBegin()
		}
	
		var prop = this.startNode(), isGenerator, startPos
		if (this.options.ecmaVersion >= 6) {
			prop.method = false
			prop.shorthand = false
			if (isPattern || refDestructuringErrors) {
				startPos = this.start
			}
			if (!isPattern)
				isGenerator = this.eat(tt.star)
		}
		this.parsePropertyName(prop)

		this.parsePropertyValue(prop, isPattern, isGenerator, startPos, refDestructuringErrors)

		this.checkPropClash(prop, propHash)

		node.properties.push(this.finishNode(prop, "Property"))

		if(this.eat(tt.braceR)){
			
			if(this.storeComments){
				this.commentEnd(prop, above, tt.braceR)
			}
			break
		}
		var inserted = false
		if(this.eat(tt.comma) || (inserted = this.insertCommas && this.skippedNewlines)){
			if(this.storeComments){
				if(inserted) node.insCommas  = (node.insCommas || 0)+1
				this.commentEndSplit(prop, above, tt.braceR, tt.comma)
			}
			if(this.eat(tt.braceR)){
				node.trail = true
				break
			}
 		}
	}
	if(this.storeComments){
		this.commentBottom(tt.braceR, node)
	}
	return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
}

pp.parsePropertyValue = function(prop, isPattern, isGenerator, startPos, refDestructuringErrors) {
	if (this.eat(tt.colon)) {
		prop.value = isPattern ? this.parseMaybeDefault(this.start) : this.parseMaybeAssign(false, refDestructuringErrors)
		prop.kind = "init"
	} else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
		if (isPattern) this.unexpected()
		prop.kind = "init"
		prop.method = true
		prop.value = this.parseMethod(isGenerator)
	} else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
						 (prop.key.name === "get" || prop.key.name === "set") &&
						 (this.type != tt.comma && this.type != tt.braceR)) {
		if (isGenerator || isPattern) this.unexpected()
		prop.kind = prop.key.name
		this.parsePropertyName(prop)
		prop.value = this.parseMethod(false)
		var paramCount = prop.kind === "get" ? 0 : 1
		if (prop.value.params.length !== paramCount) {
			var start = prop.value.start
			if (prop.kind === "get")
				this.raiseRecoverable(start, "getter should have no params")
			else
				this.raiseRecoverable(start, "setter should have exactly one param")
		}
		if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
			this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params")
	} else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
		if (this.keywords.test(prop.key.name) ||
				(this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name) ||
				(this.inGenerator && prop.key.name == "yield"))
			this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property")
		prop.kind = "init"
		if (isPattern) {
			prop.value = this.parseMaybeDefault(startPos, prop.key)
		} else if (this.type === tt.eq && refDestructuringErrors) {
			if (!refDestructuringErrors.shorthandAssign)
				refDestructuringErrors.shorthandAssign = this.start
			prop.value = this.parseMaybeDefault(startPos, prop.key)
		} else {
			prop.value = prop.key
		}
		prop.shorthand = true
	} else this.unexpected()
}

pp.parsePropertyName = function(prop) {
	if (this.options.ecmaVersion >= 6) {
		if (this.eat(tt.bracketL)) {
			prop.computed = true
			prop.key = this.parseMaybeAssign()
			this.expect(tt.bracketR)
			return prop.key
		} else {
			prop.computed = false
		}
	}
	return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true)
}

// Initialize empty function node.

pp.initFunction = function(node) {
	node.id = null
	if (this.options.ecmaVersion >= 6) {
		node.generator = false
		node.expression = false
	}
}

// Parse object or class method.

pp.parseMethod = function(isGenerator) {
	var node = this.startNode(), oldInGen = this.inGenerator
	this.inGenerator = isGenerator
	this.initFunction(node)
	this.expect(tt.parenL)
	node.params = this.parseBindingList(tt.parenR, false, false)
	if (this.options.ecmaVersion >= 6)
		node.generator = isGenerator
	this.parseFunctionBody(node, false)
	this.inGenerator = oldInGen
	return this.finishNode(node, "FunctionExpression")
}

// Parse arrow function expression with given parameters.

pp.parseArrowExpression = function(node, params) {
	var oldInGen = this.inGenerator
	this.inGenerator = false
	this.initFunction(node)
	node.params = this.toAssignableList(params, true)
	this.parseFunctionBody(node, true)
	this.inGenerator = oldInGen
	return this.finishNode(node, "ArrowFunctionExpression")
}

// Parse function body and check parameters.

pp.parseFunctionBody = function(node, isArrowFunction) {
	var isExpression = isArrowFunction && this.type !== tt.braceL

	if (isExpression) {
		node.body = this.parseMaybeAssign()
		node.expression = true
	} else {
		// Start a new scope with regard to labels and the `inFunction`
		// flag (restore them to their old value afterwards).
		var oldInFunc = this.inFunction, oldLabels = this.labels
		this.inFunction = true; this.labels = []
		node.body = this.parseBlock(true)
		node.expression = false
		this.inFunction = oldInFunc; this.labels = oldLabels
	}

	// If this is a strict mode function, verify that argument names
	// are not repeated, and it does not try to bind the words `eval`
	// or `arguments`.
	var useStrict = (!isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) ? node.body.body[0] : null;
	if (this.strict || useStrict) {
		var oldStrict = this.strict
		this.strict = true
		if (node.id)
			this.checkLVal(node.id, true)
		this.checkParams(node, useStrict)
		this.strict = oldStrict
	} else if (isArrowFunction) {
		this.checkParams(node, useStrict)
	}
}

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp.checkParams = function(node, useStrict) {
		var nameHash = {}
		for (var i = 0; i < node.params.length; i++) {
			if (useStrict && this.options.ecmaVersion >= 7 && node.params[i].type !== "Identifier")
				this.raiseRecoverable(useStrict.start, "Illegal 'use strict' directive in function with non-simple parameter list");
			this.checkLVal(node.params[i], true, nameHash)
		}
}

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors, node) {

	if(this.storeComments && node) this.commentTop(node)

	var elts = []
	while (!this.eat(close)) {
		if(this.storeComments){
			var above = this.commentBegin()
		}

		var elt
		if (allowEmpty && this.type === tt.comma){
			elt = null
		}
		else if (this.type === tt.ellipsis) {
			elt = this.parseSpread(refDestructuringErrors)
			if (this.type === tt.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
				refDestructuringErrors.trailingComma = this.lastTokStart
			}
		} else
			elt = this.parseMaybeAssign(false, refDestructuringErrors)
		elts.push(elt)

		if(this.eat(close)){
			if(this.storeComments){
				this.commentEnd(elt, above, close)
			}
			break
		}

		var inserted = false
		if(this.eat(tt.comma) || allowTrailingComma && (inserted = this.insertCommas && this.skippedNewlines)){
			if(this.storeComments){
				if(inserted) node.insCommas  = (node.insCommas || 0)+1
				this.commentEndSplit(elt, above, close, tt.comma)
			}
			if(this.eat(close)){
				if(!allowTrailingComma) this.unexpected()
				node.trail = true
				break
			}
 		}
 		else{
 			this.unexpected()
 		}
	}
	if(this.storeComments && node){
		this.commentBottom(close, node)
	}


	return elts
}

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp.parseIdent = function(liberal) {
	var node = this.startNode()
	if (liberal && this.options.allowReserved == "never") liberal = false
	if (this.type === tt.name) {
		if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) &&
				(this.options.ecmaVersion >= 6 ||
				 this.input.slice(this.start, this.end).indexOf("\\") == -1))
			this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved")
		if (!liberal && this.inGenerator && this.value === "yield")
			this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator")
		node.name = this.value
	} else if (liberal && this.type.keyword) {
		node.name = this.type.keyword
	} else {
		this.unexpected()
	}
	this.next()
	return this.finishNode(node, "Identifier")
}

// Parses yield expression inside generator.

pp.parseYield = function() {
	var node = this.startNode()

	if(this.input.charCodeAt(this.pos) === 32)node.space = ' ' 
	else node.space = ''

	this.next()
	if (this.type == tt.semi || this.canInsertSemicolon() || (this.type != tt.star && !this.type.startsExpr)) {
		node.delegate = false
		node.argument = null
	} else {
		node.delegate = this.eat(tt.star)
		node.argument = this.parseMaybeAssign()
	}
	return this.finishNode(node, "YieldExpression")
}
