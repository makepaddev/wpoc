/**
 * Defines a coherent part of the app.
 */

var CssCache = new WeakSet()
var CssSheet
var CssId = 1

class HtmlView extends require('./Base') {

    constructor(parent, props) {
        super();
        if(!parent) return

        // lets compute a CSS cache.
        var proto = Object.getPrototypeOf(this)
        if(!CssCache.has(proto)){
            var p = proto
            // build a pretty findable name
            var cls = p.constructor.name
            if(cls === 'extended') cls = p.constructor.__name__
            p = proto
            while(p.constructor.__outer__){
                p = p.constructor.__outer__
                cls = p.constructor.name + '_' + cls
            }
            proto.$cssClass =  cls + '_' + (CssId++)
            // lets make a new css class based on our props
            var rule = '.'+proto.$cssClass+'{\n'
            for(var key in this._css){
                var css = key.replace(/[A-Z]/g,function(m){
                    return '-'+m.toLowerCase()
                })
                var value = this[key]
                if(value === undefined) continue
                if(typeof value === 'number') value = value+'px'
                rule += css + ': ' + value + ';\n'
            }
            rule += '\n}'

            if(!CssSheet){
                CssSheet = document.createElement("style")
                document.head.appendChild(CssSheet);
            }
            // lets add a rule
            CssSheet.sheet.insertRule(rule)
            CssCache.add(proto)
        }   

        var domNode = document.createElement(this.elementName)
        parent.appendChild(domNode)
        var dStyle = domNode.style
        domNode.classList.add(this.$cssClass)
        // lets do the style props as immediate inline styles
        for(var key in props){
            if(key in this._css){
                var value = props[key]
                if(typeof value === 'number') value += 'px'
                dStyle[key] = value
            }
        }

        domNode.$vnode = this
        this.id = props.id
        this.domNode = domNode
    }

    properties() {
    	this.__isView__ = true
        this.inheritable('css', function(){
            this._css = Object.create(this._css || null)
            for(var key in this.css){
                this._css[key] = this.css[key]
                // set default
                this[key] = this.css[key]
            }
        });

        this.css = {
            boxSizing:'border-box',
            display:'block',
            backgroundColor:undefined,
            verticalAlign:'baseline',
            whiteSpace:'nowrap',
            left:undefined,
            top:undefined,
            width:'100%',
            height:'100%',
            float:'left',
            overflow:undefined,
            textOverflow:undefined,
            cursor:undefined,
            marginTop:0,
            marginRight:0,
            marginBottom:0,
            marginLeft:0,
            paddingTop:0,
            paddingRight:0,
            paddingBottom:0,
            paddingLeft:0,
            borderRadius:undefined,
            borderColor:undefined,
            borderStyle:'none',
            borderWidth:0
        }

        this.elementName = 'div'
    }
}

module.exports = HtmlView;