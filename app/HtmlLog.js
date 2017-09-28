/**
 *
 */

class HtmlLog extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            Container:{
                type:'View',
                backgroundColor:'#222',
                paddingLeft:'5px',
                paddingTop:'5px'
            },
            Text:{
                color:'#777',
                fontSize:'12px'
            }
        }
    }

    build(){
        return {
            type:'Container',
            width:this.width,
            height:this.height,
            children:[
                {type:'Text', text:'Application started '+Date()},
            ]
        }
    }
}

module.exports = HtmlLog
;