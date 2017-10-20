/**
 * HTML App
 */

var HtmlWidget = require('./HtmlWidget');
var Utils = require('./Utils');

class HtmlApp extends HtmlWidget {

    constructor(domNode) {
    	super(domNode)

    	this.view = new this.View()
    	this.view.domNode = domNode
        this.app = this
        this.uids = {}
        var capture = null
        var mouseNode = window

        // support resize events
        var resizes = this.$resizes = []
        this.$rebuilds = []
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
        this.pollResize = pollResize

        var ta = this.textArea = document.createElement('textarea')
        ta.className = "wpoc"
        ta.style.top = '-100px'
        ta.style.left = '-100px'
        ta.style.height = '0px'
        ta.style.width = '0px'
        ta.setAttribute('autocomplete','off')
        ta.setAttribute('autocorrect','off')
        ta.setAttribute('autocapitalize','off')
        ta.setAttribute('spellcheck','false')

        var style = document.createElement('style')
       
        ta.style.position = 'fixed'
       
        ta.addEventListener('cut', _=>{

        })
        ta.addEventListener('paste', _=>{
            
        })
        ta.addEventListener('select', _=>{
            
        })
        ta.addEventListener('input', _=>{
            
        })
        ta.addEventListener('touchmove', _=>{
            
        })
        ta.addEventListener('blur', _=>{
            if(this.$focus) this.setFocus(null)
        })
        ta.addEventListener('keydown', e=>{
            if(this.$isEditing){
                if(e.key === 'Enter'){
                    e.preventDefault()
                    this.$isEditing(ta.value)
                    this._stopEdit()
                }
                else if(e.key === 'Escape'){
                    e.preventDefault()
                    this.$isEditing(null)
                    this._stopEdit()
                }
                return
            }
            if(this.$focus && this.$focus.onKeyDown) this.$focus.onKeyDown(e)
        })
        ta.addEventListener('keyup', e=>{
            if(this.$focus && this.$focus.onKeyUp) this.$focus.onKeyUp(e)
        })

        document.head.appendChild(style)
        document.body.appendChild(ta)
        window.addEventListener('resize', function(){
            pollResize()
        })

        this.$textArea = ta

        var dblClick = 500
        var clickCount = 0
        var clickStamp = 0
        var clickLast = undefined
        window.addEventListener('mousedown', e=>{
            if(e.srcElement !== ta && this.$isEditing){
                this.$isEditing(ta.value)
                this._stopEdit()
            }
        })
        mouseNode.addEventListener('mousedown',e=>{
            var n = e.srcElement.$vnode
            capture = n
            if(n && n.widget){ 
                //if(this.$isEditing){
                  //  this.$isEditing(ta.value)
                   // this._stopEdit()
                //}

                // lets set focus to our textarea
                ta.focus()

                var time = Date.now()
                if(clickLast !== n.widget){
                    clickLast = n.widget
                    clickStamp = time
                    clickCount = 1
                }
                else{
                    if((time - clickStamp) < dblClick){
                        clickCount ++
                    }
                    else clickCount = 1
                    clickStamp = time
                }
                e.clickCount = clickCount
            }

            if(n && n.widget && n.widget.onMouseDown){                
                n.widget.onMouseDown(e, n)
                e.preventDefault()
            }
            pollResize()
        })

        mouseNode.addEventListener('mouseup',e=>{
            var n = capture
            if(n && n.widget && n.widget.onMouseUp){
                n.widget.onMouseUp(e, n)
            }
            capture = null
            pollResize()
        })
        mouseNode.addEventListener('mousemove',e=>{
            if(this.delayTimer) clearTimeout(this.delayTimer)
            this.delayTimer = undefined
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
        mouseNode.addEventListener('mouseover',e=>{
            var n = e.srcElement.$vnode
            if(n && n.widget && n.widget.onMouseOver){
                n.widget.onMouseOver(e, n)
            }
            pollResize()
        })
        mouseNode.addEventListener('mouseout',e=>{
            var n = e.srcElement.$vnode
            if(n && n.widget && n.widget.onMouseOut){
                n.widget.onMouseOut(e, n)
            }
            pollResize()
        })

        window.setTimeout(_=>{
            this.parentView = this.view
            this._rebuild(this)
        },0)
        this._animate = this._animate.bind(this)
    }

    _animate(time){
        this._reqanim = false
        for(var i = 0; i < this._animations.length ;i++){
            var anim = this._animations[i]
            if(!anim.start){
                anim.start = time
            }
            var t = 0
            if(time - anim.start >= anim.time){
                t = 1.
                this._animations.splice(i, 1)
                i--
            }
            else t = (time - anim.start) / anim.time
            anim.cb(t)
            if(t == 1.){
                anim.resolve()
            }
        }
        if(this._animations.length) this._reqanim = window.requestAnimationFrame(this._animate)
    }

    animate(time, cb){
        if(!this._animations) this._animations = []
        var resolve, prom = new Promise(function(s,j){resolve = s})
        this._animations.push({time:time, cb:cb, resolve:resolve})
        if(!this._reqanim){
            this._reqanim = window.requestAnimationFrame(this._animate)
        }
        return prom
    }

    _absPos(elem){
        var x = 0, y = 0
        while(elem){
            x += elem.offsetLeft || 0
            y += elem.offsetTop || 0
            elem = elem.offsetParent
        }
        return [x,y]
    }

    _stopEdit(){
        var ta = this.$textArea
        this.$isEditing = undefined
        ta.style.left = '-100px'
        ta.style.top = '-100px'
        ta.style.width = '0px'
        ta.style.height = '0px'
    }

    _editText(x, y, w, h, text, done){
        var ta = this.$textArea
        this.$isEditing = done
        ta.focus()
        ta.style.left = x+'px'
        ta.style.top = y+'px'
        ta.style.width = w+'px'
        ta.style.height = h+'px'
        ta.value = text
        ta.selectionStart = 0
        ta.selectionEnd = text.length
    }
   
    _buildNode(node, parent, widget, asyncShow){
        
        if(node.constructor === Object){
           
            var id = node.id || 0
            
            var type, walk = widget
            while(!type && walk){
                type = walk[node.type] 
                walk = walk.parentWidget
            }
            if(!type) type = this[node.type]
            if(!type){
                console.log('Cant instance type '+node.type, widget)
                return
            }
            
            // see if we can reuse a uid
            var main
            if(node.uid !== undefined){
                main = this.uids[node.uid]
                if(!main) main = this.uids[node.uid] = new type(parent.domNode, node)
                else main.__reused__ = true
            }
            else{
                main = new type(parent.domNode, node)
                if(asyncShow && main.__loadPromise__ && asyncShow.indexOf(main.__loadPromise__) === -1){
                    asyncShow.push(main.__loadPromise__)
                }
            }


            main.parentView = parent
            main.type = node.type
            main.parentWidget = widget

            if(main.__isWidget__){
                if(main.__reused__){ // reuse the old one
                    parent.domNode.appendChild(main.view.domNode)
                }
                else{
                    // build us instead
                    main.app = this
                    this._buildNode(main.build(), parent, main, asyncShow)
                    if(main.onBuilt) main.onBuilt()
                    if(!widget.nest) widget.nest = main
                    if(node && node.state) main.setState(node.state)
                }
                if(main.onRebuilt) main.onRebuilt()
            }
            else{
                main.widget = widget
                if(!widget.nest) widget.nest = main
                if(!widget.view){
                    if(widget.onResize){
                       this.$resizes.push(main.domNode)
                    }
                    widget.view = main
                }
                var children = node.children
                if(children) for(var i = 0; i < children.length; i++){
                    var child = children[i]
                    this._buildNode(child, main, widget, asyncShow)
                }
            }
        }
    }

    _addRebuild(node){
        var rebuilds = this.$rebuilds
        if(rebuilds.indexOf(node) !== -1) return
        rebuilds.push(node)
        if(this._raf) return
        this._raf = window.requestAnimationFrame(_=>{
            this._raf = undefined
            this.$rebuilds = []
            for(var i = 0; i < rebuilds.length; i++){

                var node = rebuilds[i]
                var nest = node
                while(nest && !nest.__isView__){
                    nest = nest.nest
                }

                nest.domNode.parentNode.removeChild(nest.domNode)

                node.view = node.nest = undefined
                this._rebuild(node)
               
                //this.pollResize()
            }
        })
    }

    delayClick(callback){
        if(this.delayTimer) clearTimeout(this.delayTimer)
        this.delayTimer = setTimeout(_=>{
            callback()
        }, 500)
    }

    _rebuild(node){
        var asyncShow = []
        // ok so we are rebuilding this node.
        var style = node.parentView.domNode.style
        var disp = style.display
        // turn off parent visibility whilst building to allow async showing
        style.display = 'none'

        // store all load promises
        var asyncShow = []
        this._buildNode(node.build(), node.parentView, node, asyncShow)
 
        if(node.onBuilt) node.onBuilt()

        // if nodes have load dependencies, wait with flipping the visible bit on the parent
        if(asyncShow.length){
            Promise.all(asyncShow).then(_=>{
                style.display = disp
                this.pollResize()
            })
        }
        else{
            style.display = disp
            this.pollResize()
        }
    }
}

module.exports = HtmlApp