/**
 *
 */

class HtmlButton extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.dependencies = {
            Bg:{
                cursor:'default',
                type:'View',
                width:undefined,
                height:undefined,
                borderRadius:'7px',
                borderWidth:'0.06em',
                paddingTop:'5px',
                paddingRight:'5px',
                paddingBottom:'5px',
                paddingLeft:'5px',
                borderColor:'#999',
                borderStyle:'solid',
            },
            Icon:{
                fontSize:'8px',
                pointerEvents: 'none',
                cursor:'default',
            },
            Text:{
                pointerEvents: 'none',
                cursor:'default',
            }
        }
        this.annotations = {
        };
        this.states = {
            default:{
                Bg:{
                    backgroundColor:'#777'
                }
            },
            clicked:{
                Bg:{
                    backgroundColor:'#aaa',
                    borderColor:'#999',
                }
            },
            over:{
                Bg:{
                    borderColor:'#a7a',
                    backgroundColor:'#444'
                }
            }
        }
    }
    
    onKeyDown(e,n){
    }

    onKeyUp(e, n){
    }

    onMouseOver(e, n){
        this.setState('over')
        this.in = true
    }

    onMouseOut(e, n){
        this.setState(this.down?'clicked':'')
        this.in = false
    }

    onMouseDown(e,n){
        this.down = true
        this.setState('clicked')
    }

    onMouseUp(e,n){
        this.down = false
        if(this.in){
            this.onClick()
        }
        this.setState(this.in?'over':'')
    }

    onResize(){
    }

    onBuilt(){
    }

    build(){
        var children = []
        if(this.icon){
            children.push(
                {type:'Icon', icon:this.icon}
            )
        }
        if(this.text){
            children.push(
                {type:'Text', text:this.text}
            )
        }
        return {
            width:this.width,
            height:this.height,
            type:'Bg',
            children:children
         }
    }
}

module.exports = HtmlButton;