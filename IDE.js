
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // alright lets create a HtmlDock
    }

    properties() {
        this.dependencies = {
            'Dock': require('./app/HtmlDock').extend({
            }),
            'Ace': require('./app/HtmlAce').extend({
            }),
            'Tree': require('./app/HtmlTree').extend({
            })
        }
    }

    // ok we need a 'dock' widget with a livecycle for the open
    // documents
    build(){
        return {
            type:'Dock',
            data:{ // the data the dock manipulates
                type:'Splitter',
                vertical:true, pos:0.25,
                pane1:{type:'Tabs',
                    tabs:[
                        {type:'Tree',title:'Project'}
                    ]
                },
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
                    pane2:{
                        type:'Tabs',
                        tabs:[
                            {type:'Ace',title:'Log output'}
                        ]
                    },
                }
            }
        }
    }
}
module.exports = IDE;