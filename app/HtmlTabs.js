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
                        height:'1.8em',
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
                        fontSize:'0.7em',
                        cursor:'default',
                        marginTop:'0.1em',
                        marginLeft:'0.3em',
                    },
                    Text:{
                        fontSize:'0.7em',
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
                    var tabNode = this.view.domNode

                    var contentFrame = tabNode.parentNode.parentNode.children[1]
                    var contentNode = contentFrame.children[this.index]
                    // how do we get the position in the tab-area?
                    
                    var absNode = this.app._absPos(tabNode)
                    var absFrame = this.app._absPos(tabNode.parentNode)
                    var dx = absNode[0] - absFrame[0]
                    if(!this.torn && 
                        (Math.abs(ydelta) > 50 || 
                            dx < -0.5 * tabNode.offsetWidth || 
                            dx > tabNode.parentNode.offsetWidth -0.5*tabNode.offsetWidth)){
                        
                        
                        // fetch the main content 
                        this.contentWidget = contentNode.children[0].$vnode.parentWidget

                        contentNode.parentNode.removeChild(contentNode)
                        var empty = tabNode.parentNode.parentNode.children[1].children.length == 0
                        tabNode.parentNode.removeChild(tabNode)
                        
                        document.body.appendChild(tabNode)
                        tabNode.style.position = 'absolute'
                        tabNode.style.zIndex = 100000
                        tabNode.style.float = 'none'
                        if(this.parentWidget.onTabTear) this.parentWidget.onTabTear(e, this, empty)
                        
                        this.torn = true
                    }
                    if(this.torn){
                        tabNode.style.left = parseInt(e.pageX - 0.5*tabNode.offsetWidth)+'px'
                        tabNode.style.top = parseInt(e.pageY - 0.5*tabNode.offsetHeight)+'px'
                        if(this.parentWidget.onTabTearMove) this.parentWidget.onTabTearMove(e, this)
                        return
                    }
                    tabNode.style.left = pos + 'px'
                    // lets check if we are < the previous
                    var tabPrev = tabNode.previousSibling
                    var tabNext = tabNode.nextSibling
                    var contentPrev = contentNode.previousSibling
                    var contentNext = contentNode.nextSibling
                    var slide, oldPos = tabNode.offsetLeft
                    if(tabPrev && tabNode.offsetLeft < tabPrev.offsetLeft + tabPrev.offsetWidth * 0.5){
                        tabNode.parentNode.insertBefore(tabNode, tabPrev)
                        contentNode.parentNode.insertBefore(contentNode, contentPrev)
                        slide = tabPrev
                    }
                    else if(tabNext && tabNode.offsetLeft + tabNode.offsetWidth > tabNext.offsetLeft + tabNext.offsetWidth * 0.5){
                        tabNode.parentNode.insertBefore(tabNode, tabNext.nextSibling)
                        contentNode.parentNode.insertBefore(contentNode, contentNext.nextSibling)
                        slide = tabNext
                    }
                    if(slide){
                        var newPos = tabNode.offsetLeft
                        this.startX -= (oldPos- newPos)
                        tabNode.style.left = e.pageX-this.startX + 'px'
                        var newIndex = slide.$vnode.widget.index
                        slide.$vnode.widget.index = tabNode.$vnode.widget.index 
                        tabNode.$vnode.widget.index = newIndex
                    }
                },
                onMouseUp:function(e){
                    if(this.torn){
                        // drop it on something.
                        var tabNode = this.view.domNode
                        tabNode.parentNode.removeChild(tabNode)
                        if(this.parentWidget.onTabTearDrop) this.parentWidget.onTabTearDrop(e, this)
                    }

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
    
    onTabTornMove(e, tab){

    }

    onMouseOver(e,n){
        // setState on the thing we are over
        //this.setState()
    }

    // how do i find all childtabs?
    setActiveTab(index){
        this.activeTab = index
        var children = this.childViewByType('TabBg').childViews()
        var contents = this.childViewByType('TabContainer').childViews()

        for(var i = 0; i < children.length; i++){
            var tab = children[i].widget
            if(i === index){
                tab.setState('selectedOver')
                contents[i].domNode.style.display = 'block'
            }
            else{
                tab.setState('')
                contents[i].domNode.style.display = 'none'
            }
        }
    }

    getTabs(){
        var ct = this.view.childViewByType('TabContainer')
        var views = ct.childViews()
        var tabs = []
        for(var i = 0; i < views.length;i ++){
            var cw = views[i].childWidgets()
            if(cw && cw[0]) tabs.push(cw[0])
        }
        return tabs
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
                state:i === this.activeTab?'selected':'none',
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
                display:i === this.activeTab?'block':'none',
                children:[this.tabs[i]]
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