/**
 *
 */

var ace = require('../ace/lib/ace/ace.js')

class HtmlAce extends require('../src/HtmlWidget') {

    constructor(app) {
        super();

        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/twilight");
        editor.session.setMode("ace/mode/javascript");
    }

    properties() {
        this.annotations = {
        };
    }

    build(){
        // some HTML representing us?
     
    }
}

module.exports = HtmlAce;