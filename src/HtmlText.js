/**
 * Defines a coherent part of the app.
 */

class HtmlText extends require('./HtmlDiv') {

    constructor(parent, props, noText) {
        super(parent, props)
        if(!parent) return
        // lets get our icon in there
        if(!noText) this.domNode.innerHTML = props.text || this.text
        var dStyle = this.domNode.style
        dStyle.color = props.color || this.color
        dStyle.fontFamily = props.fontFamily || this.fontFamily
        dStyle.fontSize = props.fontSize || this.fontSize
        dStyle.fontStyle = props.fontStyle || this.fontStyle
        dStyle.fontWeight = props.fontWeight || this.fontWeight
    }

    properties() {
        this.color = 'white'
        this.fontFamily = 'Helvetica'
        this.fontSize = '8px'
        this.fontStyle = 'normal'
        this.fontWeight = 'normal'
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlText;