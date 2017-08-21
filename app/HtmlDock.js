/**
 *
 */

class HtmlDock extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        console.log(this.Splitter)
    }

    properties() {
        this.dependencies = {
            'DropVis':{
                type:'View',
                backgroundColor:'rgba(128,128,128,0.5)',
                position:'absolute',
                zIndex:500000
            },
            'DockContainer':{
                type:'View'
            },
            'Splitter': require('./HtmlSplitter').extend({
            }),
            'Tabs': require('./HtmlTabs').extend({
                onTabTear(e, n){
                    this.app.childWidgetByType('Dock').onTabTear(e,n)
                },
                onTabTearMove(e, n){
                   this.app.childWidgetByType('Dock').onTabTearMove(e,n)
                },
                onTabTearDrop(e, n){
                   this.app.childWidgetByType('Dock').onTabTearDrop(e,n)
               }
            })
        }
    }

    // if someone yanks off a tab, we need to deal with the mouseovers
    onTabTear(e, n){
        var dv = this.dropView = new this.DropVis(document.body,{})
        var style = dv.domNode.style
       // style.zIndex = 500000000
        style.top = '0px'
        style.left = '0px'
        style.width = this.view.domNode.offsetWidth + 'px'
        style.height = this.view.domNode.offsetHeight+ 'px'
    }

    onTabTearMove(e, n){

    }

    onTabTearDrop(e, n){
        // edit the data
        var node =  this.dropView.domNode
        node.parentNode.removeChild(node)
    }

    build(){
        return {
            width:this.width,
            height:this.height,
            type:'DockContainer',
            children:[
                this.data
            ]
        }
    }
}

module.exports = HtmlDock;