/**
 * HTML Text view
 */

var msgMap = {}
var msgIds = 0
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
        this.domNode.src = (props.src || this.src)+'?id='+id
    }

    onMessage(msg){
    }

    postMessage(msg){
    	this.domNode.contentWindow.postMessage(msg, "*")
    }

    properties() {
        this.elementName = 'iframe'
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlFrame;