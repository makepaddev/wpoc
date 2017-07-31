
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // lets get this widget in place
        
        // lets create the widgets
   }

    properties() {
        this.dependencies = {
            'HtmlAce': require('./app/HtmlAce').extend({

            }),
            'HtmlSplitter': require('./app/HtmlSplitter').extend({
            
            }),
            'HtmlTabs': require('./app/HtmlTabs').extend({
            
            }),
            'HtmlTree': require('./app/HtmlTree').extend({
            
            })
        }
    }

    // prototyping build for Html UI
    build(){
        return {
            type:'HtmlSplitter',
            vertical:true, pos:0.25,
            pane1:{type:'HtmlTree'},
            pane2:{type:'HtmlSplitter', 
                vertical:false, pos:0.8,
                pane1:{
                    type:'HtmlTabs',
                    tabs:[
                        {type:'HtmlAce', title:'File1'},
                        {type:'HtmlAce', title:'File2'},
                        {type:'HtmlAce', title:'File3'}
                    ]
                },
                pane2:{type:'HtmlDiv'},
            }
        }
    }
}
module.exports = IDE;