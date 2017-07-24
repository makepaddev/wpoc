/**
 * Defines a coherent part of the app.
 */

class HtmlText extends require('./HtmlText') {

    constructor(parent, props, noText) {
        super(parent, props)
        if(!parent) return
    }

    properties() {
        this.elementName = 'textinput'
    }
}

module.exports = HtmlText;