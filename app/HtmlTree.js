/**
 *
 */

class HtmlTree extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        this.cursorPos = 0
    }

    properties() {
        this.data = {
            name:'TestA',
            open:true,
            children:[
                {name:'TestAA'},
                {name:'TestAB'},
                {name:'TestAC', children:[
                    {name:'TestACA'},
                    {name:'TestACB'}
                ]},
                {name:'TestAD'}
            ]
        }
        this.dependencies = {
            TreeContainer:{
                type:'View',
                paddingLeft:'0.15em',
                paddingTop:'0.2em',
                overflow:'auto'
            },
            Wrap:{
                type:'View',
                float:'none',
                paddingLeft:'0.2em',
                height:undefined,
                width:undefined,
            },
            Selected:{
                type:'Wrap',
                backgroundColor:'gray'
            },
            Focussed:{
                type:'Selected',
                backgroundColor:'purple'
            },
            Icon:{
                fontSize:'0.8em',
                cursor:'default',
                width:'1em', 
                color:'#ccc',
                marginTop:'0.2em',
                marginLeft:'0.2em',
                marginRight:'0.2em'
            },
            Text:{
                color:'#ccc',
                overflow:'none',
                cursor:'default',
                display:'inline-block',
                marginTop:'0.5em',
                verticalAlign:'top',
                float:'none',
                fontSize:'0.6em'
            }
        }
        this.annotations = {
        };
    }
    
    onKeyDown(e,n){
        if(e.key === 'ArrowUp'){
            this.cursorPos--
            if(this.cursorPos < 0) this.cursorPos = 0
            this.rebuild()
        }
        else if(e.key === 'ArrowDown'){
            this.cursorPos++
            if(this.cursorPos >= this.nodes.length) this.cursorPos = this.nodes.length - 1
            this.rebuild()
        }
        else if(e.key === 'ArrowLeft'){
             var node = this.nodes[this.cursorPos]
            if(!node || !node.folder) return
            node.open = false
            this.rebuild()
        }
        else if(e.key === 'ArrowRight'){
             var node = this.nodes[this.cursorPos]
            if(!node || !node.folder) return
            node.open = true
            this.rebuild()
        }
        else if(e.key === 'Enter'){

        }
    }

    onKeyUp(e, n){

    }
    
    startEdit(){
        // find the node at current cursor pos
    }

    findPath(data, node, path){
        if(data === node){
            path.unshift(data)
            return true
        }
        var folder = data.folder
        if(folder){
            for(var i = 0; i < folder.length; i++){
                var file = folder[i]
                if(this.findPath(file, node, path)){
                    path.unshift(data)
                    return true
                }
            }
        }
    }

    onMouseDown(e,n){
        this.setFocus()
        this.cursorPos = n.id

        // lets open the file somewhere.
        
        var node = this.nodes[n.id]
        // lets build a path from this node
        var path = []
        this.findPath(this.data, node, path)
        if(e.clickCount > 1 && this.onSelect && this.onSelect(node, path)) return this.rebuild()
        if(n.type === 'Text'){
            if(e.clickCount === 2){
                // lets set up a text edit with the right size
                var textNode = n.domNode
                var bgNode = n.domNode.parentNode
                var textPos = this.app._absPos(textNode)
                var bgPos = this.app._absPos(bgNode)
                var w = bgNode.offsetWidth - (textPos[0] - bgPos[0]) - 5
                var h = bgNode.offsetHeight - (textPos[1] - bgPos[1])
                var editId = n.id
                this.app._editText(textPos[0], bgPos[1], w, h, this.nodes[n.id].name, v=>{
                    if(v !== null){
                        this.nodes[editId].name = v
                        this.rebuild()
                    }
                })
            }
        }
        else{        
           
            if(!node) return
            if(node.folder){
                node.open = !node.open
            }
        }
        this.rebuild()
    }

    onFocus(){
        this.rebuild()
    }

    onBlur(){
        this.rebuild()
    }
    
    onMouseMove(e, n){
    }
    
    onMouseUp(e, n){
    }

    onResize(){
    }

    onBuilt(){
        // lets create our tree out of html elements directly

    }

    buildTree(node, out, nodes, depth){
        var id = out.length
        var sel = id ===  this.cursorPos?this.hasFocus()?'Focussed':'Selected':'Wrap'
      
        nodes.push(node)
        if(node.folder){
            var children = node.folder
            var open = node.open
            out.push(
                {type:sel,id:id,children:[
                    {type:'Icon',id:id,marginLeft:depth+'em', icon:open?'folder-open':'folder'},
                    {type:'Text',id:id,text:node.name}
                ]}
            )
            if(open){
                for(var i = 0; i < children.length ; i++){
                    this.buildTree(children[i], out, nodes, depth + 1)
                }
            }
        }
        else{
            out.push(
                {type:sel,id:id,children:[
                    {type:'Icon',id:id,marginLeft:depth+'em', icon:'file'},
                    {type:'Text',id:id,text:node.name},
                ]}
            )
        }
    }

    build(){
        var out =  []
        this.nodes = []
        this.buildTree(this.data, out, this.nodes, 0)
        return {
            width:this.width,
            height:this.height,
            type:'TreeContainer',
            children:out
         }
    }
}

module.exports = HtmlTree;