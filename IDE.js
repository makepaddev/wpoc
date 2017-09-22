
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
        
        dock.addTab(
            "editors",
            {type:'Ace', uid:'Ace'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )
        //console.log("OPEN FILE", file)
    }

    properties() {
        this.dependencies = {
            'Dock': require('./app/HtmlDock').extend({
            }),
            'Ace': require('./app/HtmlAce').extend({
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

    // ok we need a 'dock' widget with a livecycle for the open
    // documents
    build(){
        return {
            type:'Dock'
        }
    }
}
module.exports = IDE;