
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // we need to fix up reparenting/reusing the dom nodes.
        // lets make an ace thing
        this.ace1 = this.Ace(this, {title:'Ace1'})
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
                        //{type:'View', backgroundColor:'red',title:'1'},
                        //{type:'View', backgroundColor:'green',title:'2'},
                       // {type:'View', backgroundColor:'blue',title:'3'},
                        {type:'Ace', title:'Very long file'},
                       {type:'Ace', title:'File2'},
                        {type:'Ace', title:'File3'}
                    ]
                },
                pane2:{type:'View', backgroundColor:'red'},
            }
        }
    }
}
module.exports = IDE;