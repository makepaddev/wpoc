/**
 * Log view
 */

class HtmlPreview extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
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
            }),
            TestButton:require('./HtmlButton').extend({
                icon:'envelope',
                onClick(){
                    this.parentWidget.onTest()
                },
                Bg:{
                    marginLeft:'5px',
                    paddingLeft:'5px',
                    paddingRight:'4px',
                    float:'left'
                }
            })
        }
    }
    
    onMessage(msg){
        console.log("Received from iframe", msg)
    }

    onTest(){
        var frame = this.childViewByType('PreviewContainer').childViewByType('Frame')
        frame.postMessage({
           msg:"Sending a message"
        })
    }

    onBuilt(){

    }

    onRefresh(){
        this.rebuild()
    }

    build(){
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
                {type:'PreviewBar', children:[
                    {type:'CloseButton'},
                    {type:'RefreshButton'},
                    {type:'TestButton'}
                ]},
                {type:'PreviewContainer',children:[{
                    file:this.file,
                    width:'100%',
                    height:'100%',
                    src:'http://10.0.1.2:2002'+this.file,
                    type:'Frame'
                }]}
            ]
        }
    }
}

module.exports = HtmlPreview
;