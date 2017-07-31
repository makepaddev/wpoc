
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // lets get this widget in place
        
        // lets create the widgets
   }

    properties() {
        this.dependencies = {
            'Ace': require('./app/HtmlAce').extend({

            }),
            'Splitter': require('./app/HtmlSplitter').extend({
            
            }),
            'Tabs': require('./app/HtmlTabs').extend({
            
            }),
            'Tree': require('./app/HtmlTree').extend({
            
            })
        }
    }

    // prototyping build for Html UI
    build(){
        return {
            type:'Splitter',
            vertical:true, pos:0.25,
            pane1:{type:'Tree'},
            pane2:{type:'Splitter', 
                vertical:false, pos:0.8,
                pane1:{
                    type:'Tabs',
                    tabs:[
                        {type:'Ace', title:'Very long file'},
                        {type:'Ace', title:'File2'},
                        {type:'Ace', title:'File3'}
                    ]
                },
                pane2:{type:'View'},
            }
        }
    }
}
module.exports = IDE;