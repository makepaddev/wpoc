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
        this.split = 4
        this.vertical = true
        this.annotations = {
        };
        this.dependencies = {
            SplitContainer:{
                type:'View',
                //overflow:'hidden',
                color:'orange'
            },
            SplitBar:{
                type:'View'
            }
        }
    }

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
            var size = node.offsetWidth - 1
            var a = 'width'
            var b = 'height'
        }
        else{
            var size = node.offsetHeight
            var a = 'height'
            var b = 'width'
        }
        var p1 = (Math.floor(this.pos * size )- this.split*.5)
        var p2 = this.split
        var p3 = (Math.floor((1-this.pos) * size )- this.split*.5)
        pane1.style[a] = p1+'px'
        pane1.style[b] = '100%'
        split.style[a] = p2+'px'
        split.style[b] = '100%'
        pane2.style[a] = p3+'px'
        pane2.style[b] = '100%'
    }

    onResize(){
        this.updatePos()
    }

    onBuilt(){
        this.updatePos()
    }

    build(){
        return {
            width:this.width,
            height:this.height,
            type:'SplitContainer',
            children:[
                {type:'SplitContainer',children:[this.pane1]},
                {type:'SplitBar',id:'split',cursor:this.vertical?'ew-resize':'ns-resize', backgroundColor:'gray'},
                {type:'SplitContainer',children:[this.pane2]}
            ]
        }
    }
}

module.exports = HtmlSplitter;