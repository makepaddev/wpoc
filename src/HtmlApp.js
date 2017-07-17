/**
 * HTML App
 */

var HtmlWidget = require('./HtmlWidget');
var Utils = require('./Utils');

class HtmlApp extends HtmlWidget {

    constructor(domNode) {
    	super(domNode)
    	this.view = new this.HtmlDiv()
    	this.view.domNode = domNode

        var capture = null
        var mouseNode = window

        // support resize events
        var resizes = this.$resizes = []

        function pollResize(){
            for(var i = 0; i < resizes.length; i++){
                var n = resizes[i]
                if(n.offsetWidth !== n.lastWidth || 
                    n.offsetHeight !== n.lastHeight){
                    n.$vnode.widget.onResize()
                }
                n.lastWidth = n.offsetWidth
                n.lastHeight = n.offsetHeight
            }
        }

        window.addEventListener('resize', function(){
            pollResize()
        })

        mouseNode.addEventListener('mousedown',function(e){
            var n = e.srcElement.$vnode
            capture = n

            if(n && n.widget && n.widget.onMouseDown){                
                n.widget.onMouseDown(e, n)
                e.preventDefault()
            }
             pollResize()
        })
        mouseNode.addEventListener('mouseup',function(e){
            var n = capture//e.srcElement.$vnode
            if(n && n.widget && n.widget.onMouseUp){
                n.widget.onMouseUp(e, n)
            }
            capture = null
            pollResize()
        })
        mouseNode.addEventListener('mousemove',function(e){
            // check if we are captured
            if(capture){
                if(capture.widget && capture.widget.onMouseMove){
                    capture.widget.onMouseMove(e, capture)
                }
            }
            else{
                var n = e.srcElement.$vnode
                if(n && n.widget && n.widget.onMouseHover){
                    n.widget.onMouseHover(e, n)
                }
            }
            pollResize()
        })
        mouseNode.addEventListener('mouseover',function(e){
            var n = e.srcElement.$vnode
            if(n && n.widget && n.widget.onMouseOver){
                n.widget.onMouseOver(e, n)
            }
            pollResize()
        })
        mouseNode.addEventListener('mouseout',function(e){
            var n = e.srcElement.$vnode
            if(n && n.widget && n.widget.onMouseOut){
                n.widget.onMouseOut(e, n)
            }
            pollResize()
        })

        this.rebuild(this.view)
    }
   
    _buildNode(node, parent, widget){
        // alright lets process it
        if(node.constructor === Object){
            // its a plain object
            var id = node.id || 0
            // create node
            var type = widget && widget[node.type] || this[node.type]
            var main = new type(parent.domNode, node)

            // if main is not of type View, recur
            if(main instanceof HtmlWidget){
                // build us instead
                this._buildNode(main.build(), parent, main)
                if(main.onBuilt) main.onBuilt()
            }
            else{
                main.widget = widget
                if(!widget.view){
                    if(widget.onResize){
                       this.$resizes.push(main.domNode)
                    }
                    widget.view = main
                }
                var children = node.children
                if(children) for(var i = 0; i < children.length; i++){
                    var child = children[i]
                    this._buildNode(child, main, widget)
                }
            }
        }
    }

    rebuild(parent){
    	// lets call build recursively
        this._buildNode(this.build(), parent, this)
        if(this.onBuilt) this.onBuilt()
    }
}

module.exports = HtmlApp