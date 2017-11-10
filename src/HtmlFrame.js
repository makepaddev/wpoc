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
        var iframeId = msgIds++
        this.iframeId = iframeId
        msgMap[iframeId] = this
        this.srcUrl = (props.src || this.src)+'?id='+iframeId
        this.onReload(true)
        //this.domNode.src = 
        // lets append a global iframe
        
    }

    onReload(first){
        if(this.iframe){
            this.iframe.parentNode.removeChild(this.iframe)
            this.iframe = undefined

        }
        var iframe = this.iframe = document.createElement('iframe')
        iframe.src = this.srcUrl
        document.body.appendChild(iframe)
        iframeIds[this.iframeId] = iframe
        var style = iframe.style
        style.border = '0px'
        if(!first) this.onResize()
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