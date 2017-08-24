/**
 *
 */

// alright we have to do droptargets

class HtmlDock extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.dependencies = {
            'DropVis':{
                type:'View',
                backgroundColor:'rgba(128,128,255,0.5)',
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
        this.onTabTearMove(e, n)
    }

    onTabTearMove(e, n){
        var tabs = []
        this.serialize(tabs)
        function abs(node){
            var x = 0, y = 0
            while(node){
                x += node.offsetLeft
                y += node.offsetTop
                node = node.offsetParent
            }
            return [x,y]
        }
        var style = this.dropView.domNode.style
        var x = e.pageX, y = e.pageY

        for(var i = 0; i < tabs.length; i++){
            var tab = tabs[i]
            var node = tab.view.domNode
            var pos = abs(node)
            var tx = pos[0], ty = pos[1], tw = node.offsetWidth, th = node.offsetHeight
            var headSize = tab.view.domNode.childNodes[0].offsetHeight
            // dropzone
            if(x > tx && x < tx + tw &&  y > ty && y < ty + th){
                var left = (x - tx)/tw
                var right = 1-(x - tx)/tw 
                var top = (y - ty)/th
                var bottom = 1-(y-ty)/th 
                var min = Math.min(left, right, top, bottom)
                this.dropZone = i
                this.dropPart = -1
                if(min === left){
                    this.dropPart = 1
                    style.left = tx+'px'
                    style.top = ty+'px'
                    style.width = Math.floor(tw*0.5) + 'px'
                    style.height = th + 'px'
                }
                else if(min === right){
                    this.dropPart =2
                    style.left = (tx + Math.floor(tw*0.5))+'px'
                    style.top = ty+'px'
                    style.width = Math.floor(tw*0.5) + 'px'
                    style.height = th + 'px'
                }
                else if(min === top){
                    if(y < ty + headSize){
                        this.dropPart = 0
                        style.left = tx+'px'
                        style.top = ty+'px'
                        style.width = tw + 'px'
                        style.height = headSize + 'px'
                    }
                    else{
                        this.dropPart = 3
                        style.left = tx+'px'
                        style.top = ty+'px'
                        style.width = tw + 'px'
                        style.height = Math.floor(th*0.5) + 'px'
                    }
                }
                else if(min === bottom){
                    this.dropPart = 4
                    style.left = tx+'px'
                    style.top = (ty+Math.floor(th*0.5))+'px'
                    style.width = tw + 'px'
                    style.height = Math.floor(th*0.5) + 'px'
                }
                break
            }
        }
    }

    onTabTearDrop(e, n){
        // edit the data
        var node =  this.dropView.domNode
        node.parentNode.removeChild(node)
    }

    onBuilt(){
        this.serialize()
    }

    // serialize the state of the entire dock from DOM
    serialize(tabsOut){
        // lets serialize our data
        function serialize(node){
            if(!node) return null
            // we only recur on splitters
            if(node.type === 'Splitter'){
                // lets grab the things 'in' the SplitWrapper
                var data = node.getSplitted()
                return {
                    type:'Splitter',
                    pos:node.pos,
                    vertical:node.vertical,
                    pane1:serialize(data[0]),
                    pane2:serialize(data[1])
                }
            }
            else if(node.type === 'Tabs'){ // tabs
                if(tabsOut) tabsOut.push(node)
                var tabs = node.getTabs()
                var out = []
                for(var i = 0; i < tabs.length; i++){
                    out.push(serialize(tabs[i]))
                }
                return {
                    type:'Tabs',
                    activeTab:node.activeTab,
                    tabs:out
                }
            }
            else{ // its something else
                return {
                    type:node.type,
                    title:node.title
                }
            }
        }
        return serialize(this.childWidgets()[0])
    }

    // build deserializes
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