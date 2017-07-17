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
    		HtmlDiv:require('./HtmlDiv')
    	}
    }

    rebuild() {

    }
}

module.exports = HtmlWidget;