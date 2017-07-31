/**
 *
 */

class HtmlTabs extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        this.cursorPos = 0
    }

    properties() {
        this.dependencies = {
            Container:{
                type:'View'
            },
            Tab:{
                type:'View',
                paddingLeft:'0.2em',
                paddingTop:'0.3em',
                paddingRight:'0.4em',
                overflow:'hidden',
                borderRadius:'7px 7px 0px 0px',
                backgroundColor:'#444',
                marginRight:'0.2em',
                width:undefined
            },
            TabBg:{
                type:'View',
                paddingLeft:'0.2em',
                paddingTop:'0.25em',
                backgroundColor:'black',
                width:'100%',
                height:'1.8em',
                overflow:'auto'
            },
            TabContainer:{
                type:'View',
                height:'100%'
            },
            Icon:{
                fontSize:'0.8em',
                cursor:'default',
                marginTop:'0.1em',
                marginLeft:'0.3em',
            },
            Text:{
                fontSize:'0.8em',
                cursor:'default',
                fontWeight:'100',
                marginTop:'0.08em',
                marginLeft:'0.3em',
                overflow:'hidden',
                textOverflow:'ellipsis',
                whiteSpace:'nowrap'
                //width:'100%'
            }
        }
        this.annotations = {
        };
    }
    
    onKeyDown(e,n){
    }

    onKeyUp(e, n){
    }
    
    // deal with tabfocussing
    onMouseDown(e,n){
        this.setFocus()
        // just do the dom visbility switcharoo
    }

    build(){
        var out =  []
        var tabs = []
        for(var i = 0; i < this.tabs.length; i++){
            tabs.push({
                type:'Tab',
                //height:undefined,
                children:[
                    {type:'Icon',icon:'file'},
                    {type:'Text',text:this.tabs[i].title},
                ]
            })
        }
        var panes = []
        this.nodes = []
        return {
            width:this.width,
            height:this.height,
            type:'Container',
            children:[
                {type:'TabBg', children:tabs},
                {type:'TabContainer',children:this.tabs}
            ]
         }
    }
}

module.exports = HtmlTabs;