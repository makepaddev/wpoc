/**
 * Defines a coherent part of the app.
 */

class HtmlDiv extends require('./HtmlView') {

    constructor(parent, props) {
        super();
        if(!parent) return
        var domNode = document.createElement('div')
        parent.appendChild(domNode)
        var dStyle = domNode.style
        dStyle.boxSizing = 'border-box'
        dStyle.width = props.width || this.width 
        dStyle.height = props.height || this.height
        dStyle.backgroundColor = props.backgroundColor || this.backgroundColor
        dStyle.cursor = props.cursor || this.cursor
        dStyle.marginTop = props.marginTop || this.marginTop
        dStyle.marginRight = props.marginRight || this.marginRight
        dStyle.marginBottom = props.marginBottom || this.marginBottom
        dStyle.marginLeft = props.marginLeft || this.marginLeft
        dStyle.paddingTop = props.paddingTop || this.paddingTop
        dStyle.paddingRight = props.paddingRight || this.paddingRight
        dStyle.paddingBottom = props.paddingBottom || this.paddingBottom
        dStyle.paddingLeft = props.paddingLeft || this.paddingLeft
        dStyle.borderColor = props.borderColor || this.borderColor
 
        dStyle.float = props.float || this.float
        dStyle.borderStyle = props.borderStyle || this.borderStyle
        dStyle.borderWidth = props.borderWidth || this.borderWidth
        domNode.$vnode = this
        this.id = props.id
        this.domNode = domNode
    }

    properties() {
        this.float = 'left'
        this.width = '100%'
        this.height = '100%'
    }
}

module.exports = HtmlDiv;