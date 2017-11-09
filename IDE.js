
var HtmlApp = require('./src/HtmlApp'); //hi
 
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

    onOpenEditor(file){
        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Edit' + file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "editors",
            {type:'Editor', uid:'Edit'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )
        //console.log("OPEN FILE", file)
    }

    onOpenPreview(file){
        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Preview' + file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "previews",
            {type:'Preview', uid:'Preview'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )

    }

    onFileChange(path, contents){
        //update the require module tree
        require.updateJS(path, contents)

        var dock = this.childWidgetByType('Dock')
        // ok so. what if we want to hotreload all previews
        var previews = dock.findWidgetsByUid(/Preview\/.*/)
        for(var i = 0; i < previews.length; i++){
            previews[i].hotReload(path, contents)
        }
    }

    properties() {
        this.dependencies = {
            'Dock': require('./app/HtmlDock').extend({
            }),
            'Preview':require('./app/HtmlPreview').extend({
                CloseButton:{
                    onClick(){
                        var dock = this.parentWidgetByType('Dock')
                        dock.closeTabByUID(this.parentWidget.uid)
                    }
                }
            }),
            'Editor': require('./app/HtmlEditor').extend({
                CloseButton:{
                    onClick(){ 
                        var dock = this.parentWidgetByType('Dock')
                        dock.closeTabByUID(this.parentWidget.uid)
                    },
                },
                PlayButton:{
                    onClick(){
                        this.app.onOpenPreview(this.parentWidget.file)
                    }
                },
                onRebuilt(){
                    this.onCleanChange(!this.dirty)
                },
                onFileChange(content){
                    this.app.onFileChange(this.file, content)
                },
                onCleanChange(clean){
                    this.dirty = !clean
                    var tabs = this.parentWidgetByType('Tabs')
                    var tab = tabs.tabByContents(this.parentWidgetByType('Editor'))
                    var text = tab.text
                    if(clean && text.charAt(0) === '*') text = text.slice(1)
                    else if(!clean && text.charAt(0) !== '*') text = '*' + text
                    tab.setText(text)
                    // lets find all running processes with the same name
                },
                onSave(text){
                    var req = new XMLHttpRequest()
                    // compare todo against domains
                    req.addEventListener("error", _=>{
                        // error saving, handle it
                    })
                    //req.responseType = 'text'
                    req.addEventListener("load", _=>{
                        if(req.status !== 200){
                            // error saving
                        }
                        // no error saving
                    })
                    //!TODO add domain checks to url
                    req.open("POST", location.origin+this.file, true)
                    req.send(text)
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
                    this.app.onOpenEditor(str)
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