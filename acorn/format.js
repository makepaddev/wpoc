
var Base = require('../src/Base');

module.exports = class JsFormat extends Base{
	
	properties() {
	}
	
	format(ast) {
		this.text = ''
		this.ast = ast
		this.textIndent = 0
		this.parens = []
		this.parenId = 1
		this.scope = Object.create(null)
		this[this.ast.type](this.ast, null)
		return this.text
	}
	
	textOut(str){
		this.text += str
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
		if(last === 10 || last === 13) {
			this.text = this.text.slice(0,-1)
		}
	}
	
	BlockStatement(node) {

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
}