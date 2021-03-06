/**
 * HTML Text view
 */

class HtmlText extends require('./HtmlView') {

    constructor(parent, props, noText) {
        super(parent, props)
        if(!parent) return
        if(!noText) this.domNode.innerHTML = props.text || this.text
    }

    properties() {
        this.css = {
            color: 'white',
            fontFamily: 'Helvetica',
            fontSize: '8px',
            fontStyle: 'normal',
            fontWeight: 'normal'
        }
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlText;