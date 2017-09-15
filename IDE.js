
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
                        {type:'Tree', title:'Project', uid:'filetree'}
                    ]
                },
                pane2:{type:'Splitter', 
                    vertical:false, pos:0.8,
                    pane1:{
                        type:'Tabs',
                        tabs:[
                            {type:'Ace', uid:'file1', title:'Very long file', code:'Long file data'},
                            {type:'Ace', uid:'file2', title:'File2', code:'File 2 data'},
                            {type:'Ace', uid:'file3', title:'File3', code:'File3 data'}
                        ]
                    },
                    pane2:{
                        type:'Tabs',
                        tabs:[
                            {type:'Ace', uid:'log' ,title:'Log output'}
                        ]
                    },
                }
            }
        }
    }
}
module.exports = IDE;