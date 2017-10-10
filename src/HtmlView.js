/**
 * HTMLView, the main Div wrapper
 */

var CssCache = new WeakSet()
var CssSheet
var CssId = 1

function cssIfy(key, value){
    var cssKey = key.replace(/[A-Z]/g,function(m){
        return '-'+m.toLowerCase()
    })
    if(value === undefined) return ''
    if(key !== 'zIndex' && typeof value === 'number') value = value+'px'
    return cssKey + ': ' + value + ';\n'
}

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
                rule += cssIfy(key, this[key])
            }
            rule += '\n}'

            if(!CssSheet){
                CssSheet = document.createElement("style")
                document.head.appendChild(CssSheet);
            }

            // lets add a rule
            CssSheet.sheet.insertRule(rule)

            // lets compute state classes
            if(this._states){
                for(var stateName in this._states){
                    var state = this._states[stateName]
                    // lets build a statecss
                    var rule = '.'+proto.$cssClass + '_' + stateName+'{\n'
                    for(var key in this._css){
                        if(key in state){
                            rule += cssIfy(key, state[key])
                        }
                        else rule += cssIfy(key, this[key])
                    }
                    rule += '\n}'
                    CssSheet.sheet.insertRule(rule)
                }
            }

            CssCache.add(proto)
        }   

        var domNode = document.createElement(this.elementName)
        parent.appendChild(domNode)
        var dStyle = domNode.style
        this.$currentClass = this.$cssClass
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

    parentWidgetByType(type){
        var node = this.domNode
        while(node){
            var widget = node.$vnode && node.$vnode.widget
            if(widget.type === type) return widget
            node = node.parentNode
        }
    }
    
     parentViewByType(type){
        var node = this.domNode
        while(node){
            if(node.$vnode && node.$vnode.type === type) return node.$vnode
            node = node.parentNode
        }
    }

    childWidgetByType(type){
        var cn = this.domNode.childNodes
        for(var i = 0; i < cn.length; i++){
            var childView = cn[i].$vnode
            if(!childView || !childView.widget) continue
            if(childView.widget.type === type){
                return childView.widget
            }
        }
    }

    childViewByType(type){
        var cn = this.domNode.childNodes
        for(var i = 0; i < cn.length; i++){
            var childView = cn[i].$vnode
            if(!childView) continue
            if(childView.type === type){
                return childView
            }
        }
    }
    
    childWidgets(){
        var cn = this.domNode.childNodes
        var widget = this.widget
        var ret = []
        for(var i = 0; i < cn.length; i++){
            var childView = cn[i].$vnode
            if(!childView || !childView.widget) continue
            if(childView.widget !== widget) ret.push(childView.widget)
        }
        return ret
    }

    childViews(){
        var cn = this.domNode.childNodes
        var ret = []
        for(var i = 0; i < cn.length; i++){
            var childView = cn[i].$vnode
            if(!childView) continue
            ret.push(childView)
        }
        return ret
    }

    // sets a node to a state
    setState(state){
        this.state = state
        if(!this._states) return
        if(this._states[state]){
            var newClass = this.$cssClass + '_' + state
            this.domNode.classList.remove(this.$currentClass)
            this.domNode.classList.add(newClass)
            this.$currentClass = newClass
        }
        else { // switch to 'default' state
            this.domNode.classList.remove(this.$currentClass)
            this.domNode.classList.add(this.$cssClass)
            this.$currentClass = this.$cssClass
        }
    }

    properties() {
    	this.__isView__ = true
        this.state = ''
        this.inheritable('css', function(){
            this._css = Object.create(this._css || null)
            for(var key in this.css){
                this._css[key] = this.css[key]
                // set default
                this[key] = this.css[key]
            }
        });
        
        this.inheritable('states', function(){
            // flip states to targetted view classes
            this._states = Object.create(this._states || null)
            for(var key in this.states){
                this._states[key] = this.states[key]
            }
        })

        this.css = {
            boxSizing:'border-box',
            display:'block',
            backgroundColor:undefined,
            verticalAlign:'baseline',
            whiteSpace:'nowrap',
            left:undefined,
            top:undefined,
            flex:undefined,
            flexFlow:undefined,
            width:'100%',
            height:'100%',
            float:'left',
            overflow:undefined,
            overflowX:undefined,
            overflowY:undefined,
            textOverflow:undefined,
            cursor:undefined,
            position:undefined,
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
            borderWidth:0,
            outline:undefined,
            zIndex:undefined,
            pointerEvents:undefined
        }

        this.elementName = 'div'
    }
}

module.exports = HtmlView;