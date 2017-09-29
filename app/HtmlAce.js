/**
 * ACe wrapper widget
 */

var ace = require('../ace/lib/ace/ace.js')

// preload these so it doesnt flicker
require('../ace/lib/ace/mode/javascript.js')
require('../ace/lib/ace/theme/twilight.js')
require('text!../ace/lib/ace/theme/twilight.css')

class HtmlAce extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        if(this.file){
            require(['text!'+this.file], result=>{
                this.editor.setValue(result)
                this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
            })
        }
    }

    onBuilt(){
        var editor = this.editor = ace.edit(this.view.domNode);
        editor.setTheme("ace/theme/twilight");
        editor.session.setMode("ace/mode/javascript");
        editor.$blockScrolling = Infinity
    }

    properties() {
        var editor = ace.edit(undefined);

        this.annotations = {
        };
        this.dependencies = {
        }
    }

    build(){
        return {
            width:this.width,
            height:this.height,
            type:'View',
        }
    }
}

module.exports = HtmlAce;