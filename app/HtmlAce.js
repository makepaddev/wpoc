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
        super(parent, props)
    }

    onBuilt(){
        var editor = this.editor = ace.edit(this.view.domNode)
        editor.setTheme("ace/theme/twilight")
        editor.session.setMode("ace/mode/javascript")
        editor.$blockScrolling = Infinity

        var commands = editor.commands;
        commands.addCommand({
            name: "save",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: arg => {
                this.onSave(editor.getValue())
                // lets update the undo 
                editor.getSession().getUndoManager().markClean()
                window.localStorage.removeItem(this.file)
                this.clean = true
                this.onCleanChange(this.clean)
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
            // store it in local storage
            if(editor.getSession().getUndoManager().isClean()){
                window.localStorage.removeItem(this.file)
                if(!this.clean){
                    this.clean = true
                    this.onCleanChange(this.clean)
                }
            }
            else{
                window.localStorage.setItem(this.file, editor.getValue())
                if(this.clean){
                    this.clean = false
                    this.onCleanChange(this.clean)
                }
            }
        });

        if(this.file){
            var value = window.localStorage.getItem(this.file)
            require(['text!'+this.file], result=>{
                this.clean = true
                this.editor.session.setValue(result)
                this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
                //this.editor.getUndoManager().$undoStack.length = 0
                if(typeof value === 'string'){
                    this.editor.setValue(value)
                    this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
                }
            })
        }
    }  

    onCleanChange(clean){

    }

    onSave(text){

    }

    onTabFocus(){
        this.editor.focus()
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