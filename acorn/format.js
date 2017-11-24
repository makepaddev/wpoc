
// Acorn AST re-serialiser with support for comments, based on makepad project MIT source: (https://github.com/makepad),
var Base = require('../src/Base');

module.exports = class JsFormat extends Base{
	
	properties() {
	}
	
	format(ast) {
		this.text = ''
		this.ast = ast
		this.textIndent = 0
		this.parens = []
		this.ranges = []
		this.parenId = 1
		this.scope = Object.create(null)
		this[this.ast.type](this.ast, null)
		return this.text
	}
	
	textOut(str){
		if(str.indexOf('\n') !== -1){
			var out = ''
			for(var i = 0; i < str.length; i++){
				var code = str.charCodeAt(i)
				if(code === 10){
					out += '\n'
					for(var j = 0; j < this.textIndent;j++){
						out += '\t'
					}
				}
				else out += str[i]
			}
			this.text += out
		}
		else{
			this.text += str
		}
		return this.text.length
	}

	Program(node) {
		var body = node.body
		for(var i = 0;i < body.length;i++){
			var statement = body[i]
			var above = statement.above
			if(above) this.textOut(above)
			this[statement.type](statement, node)
			var side = statement.side
			if(side) this.textOut(side)
		}
		var bottom = node.bottom
		if(bottom) this.textOut(node.bottom)
	}
	
	wasNewLine() {
		var last = this.text.charCodeAt(this.text.length - 1)
		if(last === 10 || last === 13) {
			return true
		}
		return false
	}
	
	removeIndent() {
		var last = this.text.charCodeAt(this.text.length - 1)
		if(last === 9) {
			this.text = this.text.slice(0, -1)
		}
	}
	
	BlockStatement(node) {
		let parenId = this.parenId++
		var parenStart = this.textOut('{')

		this.textIndent++

		var top = node.top
		
		var body = node.body
		var bodylen = body.length - 1
		
		if(top) {
			this.textOut(top)
		}
		
		for(var i = 0; i <= bodylen; i++){
			var statement = body[i]
			if(statement.type === 'FunctionDeclaration') {
				this.scope[statement.id.name] = 'fn'
			}
		}
		
		for(var i = 0; i <= bodylen; i++){
			var statement = body[i]
			var above = statement.above
			if(above) this.textOut(statement.above)
			this[statement.type](statement)
			var side = statement.side
			if(side) this.textOut(statement.side)
			else if(i < bodylen) this.textOut('\n')
		}
		var bottom = node.bottom
		if(bottom) this.textOut(bottom)

		this.removeIndent()
		this.textIndent--
		var parenEnd = this.textOut('}')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}

	ArrayExpression(node) {
		let parenId = this.parenId++
		var parenStart = this.textOut('[')

		var elems = node.elements
		var elemslen = elems.length - 1
		
		var top = node.top
		if(top) {
			this.textIndent++
			this.textOut(top)
		}
		
		for(var i = 0; i <= elemslen; i++){
			var elem = elems[i]
			
			if(elem) {
				if(top && elem.above) this.textOut(elem.above)
				this[elem.type](elem)
			}
			if(node.trail || i < elemslen) {
				this.textOut(',')
			}
			if(elem && top) {
				var side = elem.side
				if(side) this.textOut(side)
				else if(i !== elemslen) this.textOut('\n')
			}
		}
		
		if(top) {
			var bottom = node.bottom
			if(bottom) this.textOut(bottom)
			else {
				if(!this.wasNewLine()) { 
					this.textOut('\n', )
				}
			}
			this.removeIndent()
			this.textIndent--
		}

		var parenEnd = this.textOut(']')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}

	ObjectExpression(node) {
		var parenId = this.parenId++
		var parenStart = this.textOut('{')

		var props = node.properties
		var propslen = props.length - 1

		var insCommas = node.insCommas

		var top = node.top
		if(top) {
			this.textIndent++
		}
		
		for(var i = 0; i <= propslen; i++){
			
			var prop = props[i]
			var above = prop.above
			if(top && above) this.textOut(above)
			var key = prop.key
			
			if(key.type === 'Identifier') {
				this.textOut(key.name)
			}
			else this[key.type](key)
			
			if(!prop.shorthand) {
				this.textOut(':')
				var value = prop.value
				this[value.type](value, key)
			}
			
			if(node.trail || i < propslen) {
				this.textOut(',')
			}
			
			if(top) {
				var side = prop.side
				if(side) this.textOut(side)
				else if(i !== propslen) this.textOut('\n')
			}
		}
		
		if(top) {
			var bottom = node.bottom
			if(bottom) this.textOut(bottom)
			else {
				if(!this.wasNewLine()) {
					this.textOut('\n')
				}
			}
			this.removeIndent()
			this.textIndent--
		}
		
		var parenEnd = this.textOut('}')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}

	ClassBody(node) {
		let parenId = this.parenId++
		var parenStart = this.textOut('{')

		this.textIndent++
		var top = node.top
		if(top) this.textOut(top)
		var body = node.body
		var bodylen = body.length - 1
		for(var i = 0;i <= bodylen;i++){
			var method = body[i]
			var above = method.above
			if(above) this.textOut(above)
			this[method.type](method)
			var side = method.side
			if(side) this.textOut(side)
			else if(i < bodylen) this.textOut('\n')
		}
		var bottom = node.bottom
		if(bottom) this.textOut(bottom)
		this.removeIndent()
		this.textIndent--

		var parenEnd = this.textOut('}')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}

	EmptyStatement(node) {
	}
	
	ExpressionStatement(node) {
		var exp = node.expression
		this[exp.type](exp)
	}

	SequenceExpression(node) {
		var exps = node.expressions
		var expslength = exps.length - 1
		for(var i = 0;i <= expslength;i++){
			var exp = exps[i]
			if(exp) this[exp.type](exp)
			if(i < expslength) {
				this.textOut(',')
			}
		}
	}

	ParenthesizedExpression(node) {
		var parenId = this.parenId++
		var parenStart = this.textOut('(')

		if(node.top) {
			this.textOut(node.top)
			this.textIndent++
		}
		
		var exp = node.expression
		
		if(node.top && exp.above) {
			this.textOut(exp.above)
		}
		
		this[exp.type](exp)
		
		if(node.top) {
			if(exp.side) {
				this.textOut(exp.side)
			}
			if(node.bottom) this.textOut(node.bottom)
			if(!exp.side && !node.bottom) this.textOut('\n')
			this.textIndent--
		}

		var parenEnd
		if(this.allowOperatorSpaces && node.rightSpace) {
			for(var i = node.rightSpace, rs = '';i > 0;--i)rs += ' '
			parenEnd = this.textOut(')')
		}
		else parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}

	//Literal:{raw:0, value:0},
	Literal(node) {
		var start = this.textOut(node.raw)
		this.ranges.push(start, node)
	}
	
	//Identifier:{name:0},
	Identifier(node) {
		var start = this.textOut(node.name)
		this.ranges.push(start, node)
	}
	
	//ThisExpression:{},
	ThisExpression(node) {
		this.textOut('this')
	}
	
	//MemberExpression:{object:1, property:1, computed:0},
	MemberExpression(node) {
		var obj = node.object
		this[obj.type](obj)
		var prop = node.property
		
		if(node.computed) {
			this.textOut('[')
			this[prop.type](prop, node)
			this.textOut(']')
		}
		else {
			if(node.around1) {
				this.textOut(node.around1)
			}
			this.textIndent++
			this.textOut('.')
			if(node.around2) {
				this.textOut(node.around2)
			}
			if(prop.type !== 'Identifier') this[prop.type](prop, node)
			else {
				var name = prop.name
				this.textOut(name)
			}
			this.textIndent--
		}
	}
	
	//CallExpression:{callee:1, arguments:2},
	CallExpression(node) {
		var callee = node.callee				
		var args = node.arguments
		
		this[callee.type](callee, node)

		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		
		var argslen = args.length - 1
		
		var top = node.top
		if(top) {
			this.textIndent++
			this.textOut(node.top)
		}
		
		for(var i = 0;i <= argslen;i++){
			var arg = args[i]
			var above = arg.above
			if(top && above) this.textOut(above)
			this[arg.type](arg)
			if(i < argslen) {
				this.textOut(',')
			}
			if(top) {
				var side = arg.side
				if(side) this.textOut(arg.side)
				else if(i < argslen) this.textOut('\n')
			}
		}
		
		if(top) {
			var bottom = node.bottom
			if(bottom) this.textOut(node.bottom)
			else {
				if(!this.wasNewLine()) {
					this.textOut('\n')
				}
			}
			this.removeIndent()
			this.textIndent--
		}
		var parenEnd
		if(this.allowOperatorSpaces && node.rightSpace) {
			for(var i = node.rightSpace, rs = ''; i > 0; --i) rs += ' '
			parenEnd = this.textOut(')' + rs)
		}
		else parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}
	
	//NewExpression:{callee:1, arguments:2},
	NewExpression(node) {
		var callee = node.callee
		var args = node.arguments
		this.textOut('new ')
		var around2 = node.around2
		if(around2) this.textOut(around2)
		this.CallExpression(node)
	}
	
	//ReturnStatement:{argument:1},
	ReturnStatement(node) {
		var arg = node.argument
		if(arg) {
			this.textOut('return ')
			this[arg.type](arg, node)
		}
		else {
			this.textOut('return' + node.space)
		}
	}
	
	//FunctionExpression:{id:1, params:2, generator:0, expression:0, body:1},
	FunctionExpression(node) {
		this.FunctionDeclaration(node)
	}
	
	//FunctionDeclaration: {id:1, params:2, expression:0, body:1},
	FunctionDeclaration(node, method) {
		var id = node.id
		if(id) {
			this.scope[id.name] = 'fn'
			this.textOut('function ')
			if(node.generator) {
				this.textOut('*')
			}
			this.textOut(id.name)
		}
		else {
			if(!method) {
				this.textOut('function' + (node.space?node.space:''))
			}
			else {
				this.textOut(method)
			}
		}

		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		
		var top = node.top
		if(top) this.textOut(top)
		this.textIndent++
		
		var oldscope = this.scope
		this.scope = Object.create(this.scope)
		var params = node.params
		var paramslen = params.length - 1
		for(var i = 0;i <= paramslen;i++){
			var param = params[i]
			var above = param.above
			if(top && above) this.textOut(above)

			if(param.type === 'Identifier') {
				var name = param.name
				this.scope[name] = 'arg'
				this.textOut(name)
			}
			else {
				if(param.type === 'RestElement') {
					this.scope[param.argument.name] = 'arg'
				}
				this[param.type](param)
			}
			if(i < paramslen) {
				this.textOut(',')
			}
			if(top) {
				var side = param.side
				if(side) this.textOut(param.side)
				else if(i !== paramslen) this.textOut('\n')
			}
		}
		
		if(top) {
			var bottom = node.bottom
			if(bottom) this.textOut(node.bottom)
			else {
				if(!this.wasNewLine()) {
					this.textOut('\n')
				}
			}
		}
		
		this.textIndent--
		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		
		var body = node.body
		this[body.type](body)
		
		this.scope = oldscope
	}
	
	//VariableDeclaration:{declarations:2, kind:0},
	VariableDeclaration(node, level) {
		var kind = node.kind
		if(node.space !== undefined) this.textOut(kind + node.space)
		else this.textOut(kind + ' ')

		var mid = node.mid
		if(mid) this.textOut(mid)
		
		var decls = node.declarations
		var declslen = decls.length - 1
		for(var i = 0;i <= declslen;i++){
			var decl = decls[i]
			this[decl.type](decl, kind)
			if(i !== declslen) {
				this.textOut(',')
			}
		}
	}
	
	//VariableDeclarator:{id:1, init:1},
	VariableDeclarator(node, kind) {
		var id = node.id
		
		if(node.probe) {
			this.textOut('@')
		}
		if(id.type === 'Identifier') {
			this.scope[id.name] = kind
			this.textOut(id.name)
		}
		else this[id.type](id, node)
		
		var init = node.init
		if(init) {
			var around1 = node.around1
			if(around1) this.textOut(around1)

			this.textOut(' = ')
			var around2 = node.around2
			if(around2) this.textOut(around2)
			this[init.type](init, id)
		}
	}
	
	//LogicalExpression:{left:1, right:1, operator:0},
	LogicalExpression(node) {
		var left = node.left
		var right = node.right
		this[left.type](left)
		
		var around1 = node.around1
		if(around1) this.textOut(around1)
		this.textIndent++
		
		this.textOut(node.operator)
		var around2 = node.around2
		if(around2) this.textOut(around2)

		this[right.type](right)
		this.textIndent--
	}
	
	//BinaryExpression:{left:1, right:1, operator:0},
	BinaryExpression(node) {
		var left = node.left
		var right = node.right

		this[left.type](left)

		var op = node.operator
		var doIndent = !node.around1 || op !== '/'
		var around1 = node.around1
		if(around1) {
			this.textOut(around1)
		}
		if(doIndent) this.textIndent++

		if(this.allowOperatorSpaces) {
			for(var ls = '', i = node.leftSpace || 0;i > 0;--i)ls += ' '
			for(var rs = '', i = node.rightSpace || 0;i > 0;--i)rs += ' '
			this.textOut(ls + op + rs)
		}
		else {
			//if(op === 'in') op = ' ' + op + ' '
			this.textOut(' '+op+' ')
		}
		var around2 = node.around2
		if(around2) this.textOut(around2)
		
		this[right.type](right)
		if(doIndent) this.textIndent--
	}
	
	//AssignmentExpression: {left:1, operator:0, right:1},
	AssignmentExpression(node) {
		var left = node.left
		var right = node.right
		var lefttype = left.type

		this[lefttype](left)
		var around1 = node.around1
		if(around1) this.textOut(around1)
		this.textOut(' ' +node.operator +' ')
		
		var around2 = node.around2
		if(around2) this.textOut(around2)
		
		this[right.type](right, left)
	}
	
	//ConditionalExpression:{test:1, consequent:1, alternate:1},
	ConditionalExpression(node) {
		var test = node.test
		this[test.type](test)

		this.textOut('?')
		this.textIndent++
		var afterq = node.afterq
		if(afterq) this.textOut(afterq)
		var cq = node.consequent
		this[cq.type](cq)

		this.textOut(':')
		var afterc = node.afterc
		if(afterc) this.textOut(afterc)
		var alt = node.alternate
		this[alt.type](alt)
		this.textIndent--
	}
	
	//UnaryExpression:{operator:0, prefix:0, argument:1},
	UnaryExpression(node) {
		if(node.prefix) {
			var op = node.operator
			if(op.length > 1) op = op + ' '

			this.textOut(op)
			var arg = node.argument
			var argtype = arg.type
			this[argtype](arg)
		}
		else {
			var arg = node.argument
			var argtype = arg.type
			this[argtype](arg)
			var op = node.operator
			this.textOut(op)
		}
	}
	
	//UpdateExpression:{operator:0, prefix:0, argument:1},
	UpdateExpression(node) {
		if(node.prefix) {
			var op = node.operator
			this.textOut(op)
			var arg = node.argument
			var argtype = arg.type
			this[argtype](arg)
		}
		else {
			var arg = node.argument
			var argtype = arg.type
			this[argtype](arg)
			var op = node.operator
			this.textOut(op)
		}
	}
	
	//IfStatement:{test:1, consequent:1, alternate:1},
	IfStatement(node) {

		this.textOut('if')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		var test = node.test
		this[test.type](test, 1)
		
		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		
		var after1 = node.after1
		if(after1) this.textOut(after1)
		var cq = node.consequent
		this[cq.type](cq)
		var alt = node.alternate
		if(alt) {
			this.textOut('\nelse ')
			var after2 = node.after2
			if(after2) this.textOut(after2)
			this[alt.type](alt)
		}
	}
	
	//ForStatement:{init:1, test:1, update:1, body:1},
	ForStatement(node) {

		this.textOut('for')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		var init = node.init
		if(init) this[init.type](init)

		this.textOut('; ')
		var test = node.test
		if(test) this[test.type](test)

		this.textOut('; ')
		var update = node.update
		if(update) this[update.type](update)

		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		var body = node.body
		var after = node.after
		if(after) this.textOut(after)
		this[body.type](body)
	}
	
	//ForInStatement:{left:1, right:1, body:1},
	ForInStatement(node) {

		this.textOut('for')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		var left = node.left
		this[left.type](left)

		this.textOut(' in ')
		var right = node.right
		this[right.type](right)

		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		var body = node.body
		var after = node.after
		if(after) this.textOut(after)
		this[body.type](body)
	}
	
	//ForOfStatement:{left:1, right:1, body:1},
	ForOfStatement(node) {
		this.textOut('for')

		var parenId = this.parenId++
		var parenStart = this.textOut('(')
	
		var left = node.left
		this[left.type](left)
	
		this.textOut(' of ')
		var right = node.right
		this[right.type](right)

		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		var body = node.body
		var after = node.after
		if(after) this.textOut(after)
		this[body.type](body)
	}
	
	//WhileStatement:{body:1, test:1},
	WhileStatement(node) {
		this.textOut('while')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')

		var test = node.test
		this[test.type](test)
		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})

		var after1 = node.after1
		if(after1) this.textOut(after1)
		var body = node.body
		this[body.type](body)
	}
	
	//DoWhileStatement:{body:1, test:1},
	DoWhileStatement(node) {

		this.textOut('do')
		var body = node.body
		this[body.type](body)

		this.textOut('while')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')

		var test = node.test
		this[test.type](test)

		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}
	
	//BreakStatement:{label:1},
	BreakStatement(node) {
		if(node.label) {
			var label = node.label
			this.textOut('break ')
			this[label.type](label)
		}
		else {
			this.textOut('break')
		}
	}
	
	//ContinueStatement:{label:1},
	ContinueStatement(node) {
		if(node.label) {
			var label = node.label
			this.textOut('continue ')
			this[label.type](label)
		}
		else {
			this.textOut('continue')
		}
	}
	
	//YieldExpression:{argument:1, delegate:0}
	YieldExpression(node) {
		var arg = node.argument
		if(arg) {
			this.textOut('yield ')
			if(node.delegate) {
				this.textOut('*')
			}
			this[arg.type](arg, node)
		}
		else {
			this.textOut('yield' + node.space)
		}
	}
	
	//ThrowStatement:{argument:1},
	ThrowStatement(node) {
		var arg = node.argument
		if(arg) {
			this.textOut('throw ')
			this[arg.type](arg, node)
		}
		else {
			this.textOut('throw' + node.space)
		}
	}
	
	//TryStatement:{block:1, handler:1, finalizer:1},
	TryStatement(node) {
		this.textOut('try')
		var block = node.block
		this[block.type](block)
		var handler = node.handler
		if(handler) {
			var above = handler.above
			if(above) this.textOut(above)
			this[handler.type](handler)
		}
		var finalizer = node.finalizer
		if(finalizer) {
			var above = finalizer.above
			if(above) this.textOut(above)

			this.textOut('finally')
			this[finalizer.type](finalizer)
		}
	}
	
	//CatchClause:{param:1, body:1},
	CatchClause(node) {
		this.textOut('catch')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')

		var param = node.param
		this[param.type](param)

		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})

		var body = node.body
		this[body.type](body)
	}
	
	//SpreadElement
	SpreadElement(node) {
		this.textOut('...',)
		var arg = node.argument
		this[arg.type](arg)
	}
	
	//RestElement:{argument:1}
	RestElement(node) {
		this.textOut('...')
		var arg = node.argument
		this[arg.type](arg)
	}
	
	//Super:{},
	Super(node) {
		this.textOut('super')
	}
	
	//AwaitExpression:{argument:1},
	AwaitExpression(node) {
		this.notImplemented(node)
	}
	
	//MetaProperty:{meta:1, property:1},
	MetaProperty(node) {
		this.notImplemented(node)
	}
	
	
	//ObjectPattern:{properties:3},
	ObjectPattern(node) {
		this.ObjectExpression(node)
	}
	
	
	//ObjectPattern:{properties:3},
	ArrayPattern(node) {
		this.ArrayExpression(node)
	}
	
	// AssignmentPattern
	AssignmentPattern(node) {
		var left = node.left
		var right = node.right
		this[left.type](left)
		this.textOut('=')
		this[right.type](right)
		console.log(node)
	}
	
	
	//ArrowFunctionExpression:{params:2, expression:0, body:1},
	ArrowFunctionExpression(node) {
		var parenId
		var parenStart
		if(!node.noParens) {
			parenId = this.parenId++
			parenStart = this.textOut('(')
		}
		var params = node.params
		var paramslen = params.length - 1
		for(var i = 0;i <= paramslen;i++){
			var param = params[i]
			if(param.type === 'Identifier') {
				var name = param.name
				this.scope[name] = 'arg'
				this.textOut(name)
			}
			else {
				if(param.type === 'RestElement') {
					this.scope[param.argument.name] = 'arg'
				}
				this[param.type](param)
			}
			if(i < paramslen) {
				this.textOut(',')
			}
		}

		if(!node.noParens) {
			var parenEnd = this.textOut(')')
			this.parens.push({start:parenStart, end:parenEnd, id:parenId})
		}

		this.textOut('=>')
		if(node.between) {
			var between = node.between
			if(between) this.textOut(between)
		}
		var body = node.body
		this[body.type](body)
	}
	
	//SwitchStatement:{discriminant:1, cases:2},
	SwitchStatement(node) {
		this.textOut('switch')
		var parenId = this.parenId++
		var parenStart = this.textOut('(')
		var disc = node.discriminant
		this[disc.type](disc)
		var parenEnd = this.textOut(')')
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})

		var parenStart = this.textOut('{')
		this.textIndent++

		var top = node.top
		if(top) this.textOut(top)

		var cases = node.cases
		var caseslen = cases.length
		for(var i = 0;i < caseslen;i++){
			var cas = cases[i]
			this[cas.type](cas)
		}

		var bottom = node.bottom
		if(bottom) this.textOut(bottom)

		this.removeIndent()
		this.textIndent--

		var parenEnd = this.textOut('}')
		var parenId = this.parenId++
		this.parens.push({start:parenStart, end:parenEnd, id:parenId})
	}
	
	//SwitchCase:{test:1, consequent:2},
	SwitchCase(node) {
		var above = node.above
		if(above) this.textOut(above)
		var test = node.test
		if(!test) {
			this.textOut('default')
		}
		else {
			this.textOut('case ')
			this[test.type](test)
		}

		this.textOut(':')
		var side = node.side
		if(side) this.textOut(side)
		this.textIndent++
		var cqs = node.consequent
		var cqlen = cqs.length
		for(var i = 0;i < cqlen;i++){
			var cq = cqs[i]
			var above = cq.above
			if(above) this.textOut(above)
			if(cq) this[cq.type](cq)
			var side = cq.side
			if(side) this.textOut(side)
		}
		this.textIndent--
	}
	
	//TaggedTemplateExpression:{tag:1, quasi:1},
	TaggedTemplateExpression(node) {
		var tag = node.tag
		this[tag.type](tag)
		var quasi = node.quasi
		this[quasi.type](quasi)
	}
	
	//TemplateElement:{tail:0, value:0},
	TemplateElement(node) {
		this.notImplemented(node)
	}
	
	//TemplateLiteral:{expressions:2, quasis:2},
	TemplateLiteral(node) {
		var expr = node.expressions
		var quasis = node.quasis
		var qlen = quasis.length - 1
		this.textOut('`')
		for(var i = 0;i <= qlen;i++){
			var raw = quasis[i].value.raw
			this.textOut(raw)
			if(i !== qlen) {
				this.textOut('${')
				var exp = expr[i]
				this[exp.type](exp)
				this.textOut('}')
			}
		}
		this.textOut('`')
	}
	
	//ClassDeclaration:{id:1,superClass:1},
	ClassDeclaration(node) {
		this.textOut('class ')
		var id = node.id
		if(id) {
			this.scope[id.name] = 'class'
			this[id.type](id)
			
			if(node.space) {
				this.textOut(' ')
			}
		}
		var base = node.superClass
		if(base) {
			this.textOut('extends ')
			this[base.type](base)
		}
		var body = node.body
		this[body.type](body)
	}
	
	//ClassExpression:{id:1,superClass:1},
	ClassExpression(node) {
		this.textOut('class ')
		var id = node.id
		if(id) {
			this.scope[id.name] = 'class'
			this[id.type](id)
			
			if(node.space) {
				this.textOut(' ')
			}
		}
		var base = node.superClass
		if(base) {
			this.textOut('extends ')
			this[base.type](base)
		}
		var body = node.body
		this[body.type](body)
	}
	
	//MethodDefinition:{value:1, kind:0, static:0},
	MethodDefinition(node) {
		var value = node.value
		var name = node.key.name
		if(node.static) {
			this.textOut('static ')
		}
		var kind = node.kind
		if(kind === 'get' || kind === 'set') {
			var write = kind + ' '
			this.textOut(write)
		}
		this.FunctionDeclaration(value, name)
	}
	
	//ExportAllDeclaration:{source:1},
	ExportAllDeclaration(node) {
		this.notImplemented(node)
	}
	
	//ExportDefaultDeclaration:{declaration:1},
	ExportDefaultDeclaration(node) {
		this.notImplemented(node)
	}
	//ExportNamedDeclaration:{declaration:1, source:1, specifiers:2},
	ExportNamedDeclaration(node) {
		this.notImplemented(node)
	}
	//ExportSpecifier:{local:1, exported:1},
	ExportSpecifier(node) {
		this.notImplemented(node)
	}
	//ImportDeclaration:{specifiers:2, source:1},
	ImportDeclaration(node) {
		this.notImplemented(node)
	}
	//ImportDefaultSpecifier:{local:1},
	ImportDefaultSpecifier(node) {
		this.notImplemented(node)
	}
	//ImportNamespaceSpecifier:{local:1},
	ImportNamespaceSpecifier(node) {
		this.notImplemented(node)
	}
	//ImportSpecifier:{imported:1, local:1},
	ImportSpecifier(node) {
		this.notImplemented(node)
	}

	//DebuggerStatement:{},
	DebuggerStatement(node) {
		this.textOut('debugger')
	}

	//LabeledStatement:{label:1, body:1},
	LabeledStatement(node) {
		var label = node.label
		this[label.type](label)

		this.textOut(':')
		
		var after1 = node.after1
		if(after1) this.textOut(after1)
		
		var body = node.body
		this[body.type](body)
	}

	// WithStatement:{object:1, body:1}
	WithStatement(node) {
		this.notImplemented(node)
	}

	notImplemented(node){
		console.error(node.type+' not implemented in formatter')
	}
}