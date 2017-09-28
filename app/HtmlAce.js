/**
 *
 */

var ace = require('../ace/lib/ace/ace.js')

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
        this.annotations = {
        };
        this.dependencies = {
            CloseButton:require('./HtmlButton').extend({

            })
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