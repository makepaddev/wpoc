/**
 * HTML Text view
 */

var msgMap = {}
var msgIds = 0
var iframeIds = {}
window.addEventListener('message', event=>{
    var msg = event.data
	var frame = msgMap[msg.id]//(msg.data)
	if(frame) frame.onMessage(msg)
})

class HtmlFrame extends require('./HtmlView') {

    constructor(parent, props) {
        super(parent, props)
        var id = msgIds++
        msgMap[id] = this
        //this.domNode.src = 
        // lets append a global iframe
        var iframe = this.iframe = document.createElement('iframe')
        this.src = iframe.src = (props.src || this.src)+'?id='+id
        document.body.appendChild(iframe)
        iframeIds[id] = iframe
        var style = iframe.style
        style.border = '0px'
    }

    onMessage(msg){
    }

    onResize(){
        var domNode = this.domNode
        var pos = this.widget.app._absPos(domNode)
        var size = [domNode.offsetWidth, domNode.offsetHeight]
        var style = this.iframe.style
        style.position = 'absolute'
        style.left = pos[0]+'px'
        style.top = pos[1]+'px'
        style.width = size[0]+'px'
        style.height = size[1]+'px'
    }  

    postMessage(msg){
    	this.iframe.contentWindow.postMessage(msg, "*")
    }

    properties() {
        this.elementName = 'div'
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlFrame;