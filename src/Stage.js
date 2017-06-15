/**
 *
 */

var View = require('./View');
var Base = require('./Base');

class Stage extends Base {

    constructor() {
        super();
        this.root = new View(this);
        this.rectTexture = null;
    }

    properties() {

    }

}

module.exports = Stage;