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
            HtmlDiv:{
                paddingLeft:'0.15em',
                paddingTop:'0.2em',
                overflow:'auto'
            },
            HtmlWrap:require('../src/HtmlDiv').extend({
                float:'none',
                paddingLeft:'0.2em',
                height:undefined,
                width:undefined,
            }),
            HtmlSelect:{
                type:'HtmlWrap',
                backgroundColor:'purple'
            },
            HtmlIcon:require('../src/HtmlIcon').extend({
                fontSize:'0.8em',
                cursor:'default',
                width:'1em', 
                color:'#ccc',
                marginTop:'0.2em',
                marginLeft:'0.2em',
                marginRight:'0.2em'
            }),
            HtmlText:require('../src/HtmlText').extend({
                color:'#ccc',
                overflow:'none',
                cursor:'default',
                display:'inline-block',
                marginTop:'0.5em',
                verticalAlign:'top',
                float:'none',
                fontSize:'0.6em'
            })
        }
        this.annotations = {
        };
    }
    
    onKeyDown(e,n){

    }

    onKeyUp(e, n){
        
    }

    onMouseDown(e,n){
      
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

    buildTree(node, out, depth){
        var sel = out.length ===  this.cursorPos?'HtmlSelect':'HtmlWrap'
        console.log
        if(node.children){
            var children = node.children
            out.push(
                {type:sel,children:[
                    {type:'HtmlIcon',marginLeft:depth+'em', icon:'folder-open'},
                    {type:'HtmlText',float:'none',text:node.name}
                ]}
            )
            for(var i = 0; i < children.length ; i++){
                this.buildTree(children[i], out, depth + 1)
            }
        }
        else{
            out.push(
                {type:sel,children:[
                    {type:'HtmlIcon',marginLeft:depth+'em', icon:'file'},
                    {type:'HtmlText',text:node.name},
                ]}
            )
        }
    }

    build(){
        var out = []
        this.buildTree(this.data, out, 0)
        return {
            width:this.width,
            height:this.height,
            type:'HtmlDiv',
            children:out
         }
    }
}

module.exports = HtmlTree;