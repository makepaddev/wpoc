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
            Tab:require('../src/HtmlWidget').extend({
                dependencies:{
                    Bg:{
                        type:'View',
                        paddingLeft:'0.2em',
                        paddingTop:'0.3em',
                        paddingRight:'0.4em',
                        overflow:'hidden',
                        borderRadius:'7px 7px 0px 0px',
                        backgroundColor:'#444',
                        marginRight:'2px',
                        width:undefined
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
                },
                onMouseDown:function(){
                    // select this tab
                    this.parentWidget.setActiveTab(this.index)
                },
                onMouseUp:function(){
                },
                isSelected(){
                    return this.state.indexOf('selected') !== -1
                },
                onMouseOver:function(){
                    this.setState(this.isSelected()?'selectedOver':'over')
                },
                onMouseOut:function(){
                    this.setState(this.isSelected()?'selected':'')
                },
                states:{
                    selected:{
                        Bg:{
                            backgroundColor:'#777'
                        }
                    },
                    selectedOver:{
                        Bg:{
                            backgroundColor:'#aaa'
                        }
                    },
                    over:{
                        Bg:{
                            backgroundColor:'#999'
                        }
                    }
                },
                build(){
                    return {
                        type:'Bg',
                        children:[
                            {type:'Icon',icon:this.icon},
                            {type:'Text',text:this.text},
                        ]
                    }
                }
            }),
            TabBg:{
                type:'View',
                paddingLeft:'2px',
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

        }

        this.annotations = {
        };
    }
    
    onKeyDown(e,n){
    }

    onKeyUp(e, n){
    }
    
    onMouseOver(e,n){
        // setState on the thing we are over
        //this.setState()
    }

    // how do i find all childtabs?
    setActiveTab(index){
        var children = this.childViewByType('TabBg').childViews()
        for(var i = 0; i < children.length; i++){
            var tab = children[i].widget
            if(i === index){
                tab.setState('selectedOver')
            }
            else{
               tab.setState('')
            }
        }
    }

    // deal with tabfocussing
    onMouseDown(e,n){
        this.setFocus()
    }

    build(){
        var out =  []
        var tabs = []
        for(var i = 0; i < this.tabs.length; i++){
            tabs.push({
                type:'Tab',
                icon:'file',
                index:i,
                text:this.tabs[i].title
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