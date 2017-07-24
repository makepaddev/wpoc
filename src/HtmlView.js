/**
 * Defines a coherent part of the app.
 */

class HtmlView extends require('./Base') {

    constructor(parent, props) {
        super();
    }

    properties() {
    	this.__isView__ = true;
    }
}

module.exports = HtmlView;