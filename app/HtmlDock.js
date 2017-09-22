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
                onTabTear(e, n, empty){
                    this.app.childWidgetByType('Dock').onTabTear(e, n, empty)
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
    onTabTear(e, n, empty){
        var dv = this.dropView = new this.DropVis(document.body, {})
        // what if we tear off the last tab in a splitter,
        // then we need to rebuild.
        this.dropWidget = n.contentWidget
        this.onTabTearMove(e, n)
        if(empty){ // lets rebuild to allow a splitter to fold
            this.data = this.serialize()
            this.rebuild()
        }
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
            var path = tabs[i].path
            var tab = tabs[i].tab
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
                this.dropPath = path
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
  
        var data = this.serialize()
        var steps = this.dropPath.split('/')
        var node = data
        for(var i = 0; i < steps.length; i++){
            if(steps[i] === '1'){
                node = node.pane1
            }
            else node = node.pane2
        }
        if(node.type === 'Tabs'){
            var newTab = {
                type:this.dropWidget.type,
                uid:this.dropWidget.uid,
                title:this.dropWidget.title
            }
            if(this.dropPart == 0){ // add to tabs
                node.tabs.push(newTab)
            }
            else if(this.dropPart === 1){ // split left
                node.type = 'Splitter'
                node.vertical = true
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.pane2 = {
                    type:'Tabs',
                    tabs:node.tabs
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 2){ // split right
                node.type = 'Splitter'
                node.vertical = true
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:node.tabs
                }                
                node.pane2 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 3){ // split top
                node.type = 'Splitter'
                node.vertical = false
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.pane2 = {
                    type:'Tabs',
                    tabs:node.tabs
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 4){ // split bottom
                node.type = 'Splitter'
                node.vertical = false
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:node.tabs
                }                
                node.pane2 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.tabs = undefined
            }

        }
        this.data =  data
        this.rebuild()
    }

    onBuilt(){
        this.serialize()
    }

    addTab(group, newTemplate){
        var data = this.serialize()
        function walk(node){
            if(node.type === 'Splitter'){
                walk(node.pane1)
                walk(node.pane2)
            }
            else if(node.type === 'Tabs'){
                if(node.group === group){
                    // lets set the selectedIndex
                    node.activeTab = 
                        node.tabs.push(newTemplate) - 1
                }
            }
        }
        walk(data)
        this.data = data
        this.rebuild()
    }

    // serialize the state of the entire dock from DOM
    serialize(tabsOut){
        // lets serialize our data
        function serialize(node, path){
            if(!node) return null
            // we only recur on splitters
            if(node.type === 'Splitter'){
                if(path) path = path+'/'
                // lets grab the things 'in' the SplitWrapper
                var data = node.getSplitted()
                var split = {
                    type:'Splitter',
                    pos:node.pos,
                    vertical:node.vertical,
                    pane1:serialize(data[0], path+'1'),
                    pane2:serialize(data[1], path+'2') 
                }
                // so what do we do when a tab in a splitter is empty?
                if(split.pane1.type === 'Tabs' && split.pane1.tabs.length === 0){
                    // we have to remove ourselves 
                    return split.pane2
                }
                else if(split.pane2.type === 'Tabs' && split.pane2.tabs.length === 0){
                    return split.pane1
                }
                return split
            }
            else if(node.type === 'Tabs'){ // tabs
                if(tabsOut) tabsOut.push({tab:node, path:path})
                var tabs = node.getTabs()
                var out = []
                for(var i = 0; i < tabs.length; i++){
                    out.push(serialize(tabs[i]))
                }
                return {
                    type:'Tabs',
                    group:node.group,
                    activeTab:node.activeTab,
                    tabs:out
                }
            }
            else{ // its something else
                return {
                    type:node.type,
                    uid:node.uid,
                    title:node.title
                }
            }
        }
        return serialize(this.childWidgets()[0], '')
    }

    // build deserializes
    build(){
        return {
            width:this.width,
            height:this.height,
            type:'DockContainer',
            children:this.data?[
                this.data
            ]:null
        }
    }
}

module.exports = HtmlDock;