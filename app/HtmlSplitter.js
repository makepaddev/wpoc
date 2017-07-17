/**
 *
 */

class HtmlSplitter extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.min = 0.1
        this.max = 0.9
        this.pos = 0.5
        this.split = 6
        this.vertical = true
        this.annotations = {
        };
    }
    // alrighty so how do we forward those props set on our
    // widget into our view.. especially the size things
    onMouseDown(e,n){
        if(n.id !== 'split') return
    }
    
    onMouseMove(e, n){
        if(n.id !== 'split') return
        var node = this.view.domNode
        var vx = e.pageX - node.offsetLeft
        var vy = e.pageY - node.offsetTop
        if(this.vertical){
            this.pos = vx/node.offsetWidth
        }
        else{
            this.pos = vy/node.offsetHeight
        }
        // lets compute the pos from mouse coord in this.view.domNode
        if(this.pos < this.min) this.pos = this.min
        if(this.pos > this.max) this.pos = this.max
        this.updatePos()
    }
    
    onMouseUp(e, n){
        if(n.id !== 'split') return
    }

    updatePos(){
        var node = this.view.domNode
        var pane1 = node.children[0]
        var split = node.children[1]
        var pane2 = node.children[2]
        if(this.vertical){
            var size = node.offsetWidth
            var a = 'width'
            var b = 'height'
        }
        else{
            var size = node.offsetHeight
            var a = 'height'
            var b = 'width'
        }
        pane1.style[a] = parseInt(this.pos * size - this.split*.5)+'px'
        pane1.style[b] = '100%'
        split.style[a] = this.split+'px'
        split.style[b] = '100%'
        pane2.style[a] = parseInt((1-this.pos) * size - this.split*.5)+'px'
        pane2.style[b] = '100%'
    }

    onResize(){
        this.updatePos()
    }

    onBuilt(){
        // lets set our left/right geom according to our splitter
        this.updatePos()
    }

    build(){
        // this splitter now needs to override
        // left, right 
        return {
            width:this.width,
            height:this.height,
            type:'HtmlDiv',
            children:[
                {type:'HtmlDiv',children:[this.pane1]},
                {type:'HtmlDiv',id:'split',cursor:this.vertical?'ew-resize':'ns-resize', backgroundColor:'gray'},
                {type:'HtmlDiv',children:[this.pane2]}
            ]
        }
    }
}

module.exports = HtmlSplitter;