/**
 * HTML Text view
 */

class HtmlFrame extends require('./HtmlView') {

    constructor(parent, props) {
        super(parent, props)
        this.domNode.src = props.src || this.src
    }

    properties() {
        this.elementName = 'iframe'
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlFrame;