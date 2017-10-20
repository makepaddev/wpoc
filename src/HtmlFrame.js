/**
 * HTML Text view
 */

var msgMap = new WeakMap()
window.addEventListener('message', msg=>{
	var frame = msgMap.get(msg.source.window)
	if(frame) frame.onMessage(msg.data)
})

class HtmlFrame extends require('./HtmlView') {

    constructor(parent, props) {
        super(parent, props)
        this.domNode.src = props.src || this.src
        msgMap.set(this.domNode.contentWindow, this)
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