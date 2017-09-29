
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // alright lets create a HtmlDock
        // load the project.
        require(['text!/project.json'], result=>{
            var layout = JSON.parse(result)
            // rebuild the dock from project
            var dock = this.childWidgetByType('Dock')
            dock.data = layout
            dock.rebuild()
        })
    }

    onOpenFile(file){
        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Edit'+file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "editors",
            {type:'Editor', uid:'Edit'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )
        //console.log("OPEN FILE", file)
    }

    properties() {
        this.dependencies = {
            'Dock': require('./app/HtmlDock').extend({
            }),
            'Editor': require('./app/HtmlEditor').extend({
                CloseButton:{
                    onClick(){ 
                        var dock = this.parentWidgetByType('Dock')
                        var tabs = this.parentWidgetByType('Tabs')
                        tabs.closeTabByContent(this.parentWidgetByType('Editor'))
                        var data = dock.serialize()
                        // what we need to do is remove this tab by UID
                        // from the data, not use closetab by content
                        dock.data = data
                        dock.rebuild()
                    },
                },
                onCleanChange(clean){
                    var tabs = this.parentWidgetByType('Tabs')
                    var tab = tabs.tabByContents(this.parentWidgetByType('Editor'))
                    var text = tab.text
                    if(clean && text.charAt(0) === '*') text = text.slice(1)
                    else if(!clean && text.charAt(0) !== '*') text = '*' + text
                    tab.setText(text)
                }

            }),
            'Log': require('./app/HtmlLog').extend({
                
            }),
            'Tree': require('./app/HtmlTree').extend({
                onSelect(node, path){
                    var str = ''
                    for(var i = 0; i < path.length; i++){
                        var seg = path[i].name
                        if(str.length && str[str.length - 1] !== '/') str += '/'
                        str += seg
                    }
                    // ok now we have to open a new editor for file str.
                    this.app.onOpenFile(str)
                    return true
                }
            })
        }
    }

    build(){
        return {
            type:'Dock'
        }
    }
}
module.exports = IDE;