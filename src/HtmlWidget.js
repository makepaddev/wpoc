/**
 * Defines a coherent part of the app.
 */

let Utils = require('./Utils');
var Widget = require('./Widget');

class HtmlWidget extends require('./Base') {

    constructor(parent, props) {
        super();
        for(var key in props){
            this[key] = props[key]
        }
    }

    properties() {
    	this.inheritable('dependencies', require('./dependencies'));
    	this.dependencies = {
    		View:require('./HtmlView'),
            Icon:require('./HtmlIcon'),
            Text:require('./HtmlText')
    	}
        this.__isWidget__ = true;
    }

    rebuild() {
        // lets flag us as need rebuild,
        // however the parent shouldnt need to rebuild.
        this.app._addRebuild(this)
    }

    setFocus(){
        if(this.app.$focus && this.app.$focus.onBlur){
            this.app.$focus.onBlur()
        }
        this.app.$focus = this
        if(this.app.$focus && this.app.$focus.onFocus){
            this.app.$focus.onFocus()
        }
    }

    hasFocus(){
        return this.app.$focus === this
    }
}

module.exports = HtmlWidget;