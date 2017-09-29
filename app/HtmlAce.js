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
                this.clean = true
                this.editor.session.setValue(result)
                //this.editor.getUndoManager().$undoStack.length = 0
                this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
            })
        }
    }

    onBuilt(){
        var editor = this.editor = ace.edit(this.view.domNode);
        editor.setTheme("ace/theme/twilight");
        editor.session.setMode("ace/mode/javascript");
        editor.$blockScrolling = Infinity

        var commands = editor.commands;
        commands.addCommand({
            name: "save",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: function(arg) {
                // lets update the undo 
                editor.getUndoManager().markClean()
            }
        });
        /*
        commands.addCommand({
            name: "load",
            bindKey: {win: "Ctrl-O", mac: "Command-O"},
            exec: function(arg) {
                var session = env.editor.session;
                var name = session.name.match(/[^\/]+$/);
                var value = localStorage.getItem("saved_file:" + name);
                if (typeof value == "string") {
                    session.setValue(value);
                    env.editor.cmdLine.setValue("loaded "+ name);
                } else {
                    env.editor.cmdLine.setValue("no previuos value saved for "+ name);
                }
            }
        });*/

        editor.on('input', e=>{
            if(editor.getSession().getUndoManager().isClean()){
                if(!this.clean){
                    this.clean = true
                    this.onCleanChange(this.clean)
                }
            }
            else{
                if(this.clean){
                    this.clean = false
                    this.onCleanChange(this.clean)
                }
            }
        });
    }  

    onCleanChange(clean){

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