/**
 * Log view
 */

class HtmlPreview extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        this.loadJS()
    }

    properties() {
        this.dependencies = {
            Frame:require('../src/HtmlFrame').extend({
                onMessage(msg){
                    this.widget.onMessage(msg)
                }
            }),
            PreviewBar:{
                backgroundColor:'#222',
                type:'View',
                paddingTop:'5px',
                paddingLeft:'5px',
                paddingRight:'5px',
                height:'1.9em'
            },
            PreviewContainer:{
                type:'View',
                height:'calc(100% - 2em)',
            },
            CloseButton:require('./HtmlButton').extend({
                icon:'close',
                Bg:{
                    float:'right'
                }
            }),
            RefreshButton:require('./HtmlButton').extend({
                icon:'refresh',
                onClick(){
                    this.parentWidget.onRefresh()
                },
                Bg:{
                    paddingLeft:'5px',
                    paddingRight:'4px',
                    float:'left'
                }
            })
        }
    }
    
    onMessage(msg){
        // lets send the iframe the code
        if(msg.cmd === 'booted'){
            this.jsLoadPromise.then(modules=>{
                // lets send these results to the worker
                this.postMessage({
                    cmd:'boot',
                    main:this.file,
                    loader:require.bootLoader.toString(),
                    modules:modules
                })
            })
        }
    }

    postMessage(msg){
        var frame = this.childViewByType('PreviewContainer').childViewByType('Frame')
        frame.postMessage(msg,"*")
    }

    hotReload(file, contents){
        this.postMessage({
            cmd:'hotReload',
            file:file,
            contents:contents
        })
    }

    onBuilt(){
        // load all deps
    }

    loadJS(){
        this.jsLoadPromise =  require.loadJS('..'+this.file)
    }

    onRefresh(){
        this.loadJS()

        this.rebuild()
    }

    onResize(){
        this.childViewByType('PreviewContainer').childViewByType('Frame').onResize()
    }

    build(){
        var ips = require.getHeaders().match(/external\-ips:\ (.*),?/)
        var extip = ips && ips[1] || location.host
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
                {type:'PreviewBar', children:[
                    {type:'CloseButton'},
                    {type:'RefreshButton'}
                ]},
                {type:'PreviewContainer',children:[{
                    file:this.file,
                    outerUid:this.uid,
                    width:'100%',
                    height:'100%',
                    src:'http://'+extip+'/app/iframeworker.html',
                    type:'Frame'
                }]}
            ]
        }
    }
}

module.exports = HtmlPreview
;