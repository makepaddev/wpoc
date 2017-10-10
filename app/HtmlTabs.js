/**
 * Tabs widget with slideable/draggable tabs
 */

class HtmlTabs extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        if(this.activeTab === undefined) this.activeTab = 0
    }

    properties() {
        this.dependencies = {
            Container:{
                type:'View'
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
                        color:'#aaa',
                        fontSize:'0.7em',
                        cursor:'default',
                        marginTop:'0.1em',
                        marginLeft:'0.3em',
                    },
                    Text:{
                        color:'#aaa',
                        fontSize:'0.7em',
                        cursor:'default',
                        fontWeight:'100',
                        marginTop:'0.08em',
                        marginLeft:'0.3em',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap'
                    }
                },
                states:{
                    selected:{
                        Bg:{
                            zIndex:"10000",
                            backgroundColor:'#777'
                        },
                        Icon:{
                            color:'#fff'
                        },
                        Text:{
                            color:'#fff'
                        }
                    },
                    selectedOver:{
                        Bg:{
                            zIndex:"10000",
                            backgroundColor:'#aaa'
                        },
                        Icon:{
                            color:'#fff'
                        },
                        Text:{
                            color:'#fff'
                        }
                    },
                    over:{
                        Bg:{
                            backgroundColor:'#999'
                        },
                        Icon:{
                            color:'#fff'
                        },
                        Text:{
                            color:'#fff'
                        }
                    }
                },
                onMouseDown:function(e){
                    this.parentWidget.setActiveTab(this.index)
                    this.startX = e.pageX
                    this.startY = e.pageY

                },
                closeTab(){
                    var tabNode = this.view.domNode
                    var contentFrame = tabNode.parentNode.parentNode.children[1]
                    var contentNode = contentFrame.children[this.index]
                    tabNode.parentNode.removeChild(tabNode)
                    contentNode.parentNode.removeChild(contentNode)

                },
                onMouseMove:function(e){
                    var pos =  e.pageX - this.startX
                    var ydelta = e.pageY - this.startY

                    var tabNode = this.view.domNode

                    var contentFrame = tabNode.parentNode.parentNode.children[1]
                    var contentNode = contentFrame.children[this.index]
                    
                    var absNode = this.app._absPos(tabNode)
                    var absFrame = this.app._absPos(tabNode.parentNode)
                    var dx = absNode[0] - absFrame[0]
                    if(!this.torn && 
                        (Math.abs(ydelta) > 50 || 
                            dx < -0.5 * tabNode.offsetWidth || 
                            dx > tabNode.parentNode.offsetWidth -0.5*tabNode.offsetWidth)){
                        
                        this.contentWidget = contentNode.children[0].$vnode.parentWidget
                        contentNode.parentNode.removeChild(contentNode)
                        var empty = tabNode.parentNode.parentNode.children[1].children.length == 0
                        tabNode.parentNode.removeChild(tabNode)
                        
                        document.body.appendChild(tabNode)
                        tabNode.style.position = 'absolute'
                        tabNode.style.zIndex = 100000
                        tabNode.style.float = 'none'
                        if(this.parentWidget.onTabTear) this.parentWidget.onTabTear(e, this, empty)

                        this.parentWidget.setActiveTab(Math.max(0, this.index-1))

                        this.torn = true
                    }
                    if(this.torn){
                        tabNode.style.left = parseInt(e.pageX - 0.5*tabNode.offsetWidth)+'px'
                        tabNode.style.top = parseInt(e.pageY - 0.5*tabNode.offsetHeight)+'px'
                        if(this.parentWidget.onTabTearMove) this.parentWidget.onTabTearMove(e, this)
                        return
                    }
                    tabNode.style.left = pos + 'px'
                    
                    var tabPrev = tabNode.previousSibling
                    var tabNext = tabNode.nextSibling
                    var contentPrev = contentNode.previousSibling
                    var contentNext = contentNode.nextSibling
                    var slide, oldPos = tabNode.offsetLeft
                    // lets check if we are < the previous
                    if(tabPrev && tabNode.offsetLeft < tabPrev.offsetLeft + tabPrev.offsetWidth * 0.5){
                        tabNode.parentNode.insertBefore(tabNode, tabPrev)
                        contentNode.parentNode.insertBefore(contentNode, contentPrev)
                        slide = tabPrev
                    }
                    // or > the next one
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
                        var tabNode = this.view.domNode
                        tabNode.parentNode.removeChild(tabNode)
                        if(this.parentWidget.onTabTearDrop) this.parentWidget.onTabTearDrop(e, this)
                    }

                    // animate the sliding of the tabs when you let go
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
                
                setText(text){
                    this.text = text
                    var txt = this.childViewByType('Text')
                    txt.domNode.innerHTML = text
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
                overflowY:'hidden',
                overflowX:'auto'
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
    }

    tabByContents(content){
        var domNode = content.view.domNode
        var content = domNode.parentNode
        var index = 0
        var child = content
        while( (child = child.previousSibling) != null ) index++
        var tabs = content.parentNode.parentNode.children[0]
        return tabs.children[index].$vnode.widget
    }

    closeTabByContent(content){
        var tab = this.tabByContents(content)
        var containerNode = content.view.domNode.parentNode
        var tabNode = tab.view.domNode
        containerNode.parentNode.removeChild(containerNode)
        tabNode.parentNode.removeChild(tabNode)
        this.setActiveTab(Math.max(0, tab.index - 1))
    }

    setActiveTab(index){
        this.activeTab = index
        var children = this.childViewByType('TabBg').childViews()
        var contents = this.childViewByType('TabContainer').childViews()

        for(var i = 0; i < children.length; i++){
            var tab = children[i].widget
            if(i === index){
                tab.setState('selectedOver')
                contents[i].domNode.style.display = 'block'

                var widget = contents[i].domNode.children[0].$vnode.widget
                if(widget.onTabFocus){
                    widget.onTabFocus()
                }
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