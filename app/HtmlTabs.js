/**
 *
 */

class HtmlTabs extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        this.activeTab = 0
    }

    properties() {
        this.dependencies = {
            Container:{
                type:'View',
                //display:'flex',
                //flexFlow:'column nowrap'
            },
            Tab:require('../src/HtmlWidget').extend({
                dependencies:{
                    Bg:{
                        position:'relative',
                        left:0,
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
                onMouseDown:function(e){
                    // select this tab
                    this.parentWidget.setActiveTab(this.index)
                    this.startX = e.pageX
                    this.startY = e.pageY
                },
                onMouseMove:function(e){
                    var pos =  e.pageX - this.startX
                    var ydelta = e.pageY - this.startY
                    if(Math.abs(ydelta) > 50){
                        console.log("TEAR IT")
                    }
                    var node = this.view.domNode
                    node.style.left = pos + 'px'
                    // lets check if we are < the previous
                    var prev = node.previousSibling
                    var next = node.nextSibling
                    var slide, oldPos = node.offsetLeft
                    if(prev && node.offsetLeft < prev.offsetLeft + prev.offsetWidth * 0.5){
                        node.parentNode.insertBefore(node, prev)
                        slide = prev
                    }
                    else if(next && node.offsetLeft + node.offsetWidth > next.offsetLeft + next.offsetWidth * 0.5){
                        node.parentNode.insertBefore(node, next.nextSibling)
                        slide = next
                    }
                    if(slide){
                        var newPos = node.offsetLeft
                        this.startX -= (oldPos- newPos)
                        node.style.left = e.pageX-this.startX + 'px'
                        var newIndex = slide.$vnode.widget.index
                        slide.$vnode.widget.index = node.$vnode.widget.index 
                        node.$vnode.widget.index = newIndex
                    }
                },
                onMouseUp:function(){
                    // simple animation system
                    var start = parseInt(this.view.domNode.style.left)
                    this.app.animate(100, t=>{
                        t=1-t
                        this.view.domNode.style.left = parseInt(t*t*t*start)+'px'
                    })
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
                            zIndex:"10000",
                            backgroundColor:'#777'
                        }
                    },
                    selectedOver:{
                        Bg:{
                            zIndex:"10000",
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
                height:'1.8em',
                overflow:'hidden'
            },
            TabContainer:{
                type:'View',
                height:'calc(100% - 1.8em)',
            },
            TabPage:{
                float:'none',
                backgroundColor:'orange',
                type:'View',
                width:'100%',
                height:'100%'
            }

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
        this.activeTab = index
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
        for(var i = 0; i < this.tabs.length; i++){
            panes.push({
                type:'TabPage',
                children:i === this.activeTab?[this.tabs[i]]:null
            })
        }
        return {
            width:this.width,
            height:this.height,
            type:'Container',
            children:[
                {type:'TabBg', children:tabs},
                {type:'TabContainer',children:panes}
            ]
         }
    }
}

module.exports = HtmlTabs;