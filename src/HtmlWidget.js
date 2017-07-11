/**
 * Defines a coherent part of the app.
 */

let Utils = require('./Utils');
var Widget = require('./Widget');

class HtmlWidget extends Widget {

    constructor(app) {
        super();
        this.app = app;
    }

    properties() {
    }

    rebuild() {
    }
}

module.exports = HtmlWidget;