
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // lets get this widget in place
        
        // lets create the widgets
   }

    properties() {
        this.dependencies = {
            'HtmlAce': require('./app/HtmlAce'),
            'HtmlSplitter': require('./app/HtmlSplitter')
        }
    }

    // prototyping build for Html UI
    build(){
        return {
            type:'HtmlSplitter',
            vertical:true, pos:0.25,
            pane1:{type:'HtmlDiv',backgroundColor:'yellow'},
            pane2:{type:'HtmlSplitter', 
                vertical:false, pos:0.8,
                pane1:{type:'HtmlAce'},
                pane2:{type:'HtmlDiv',backgroundColor:'purple'},
            }
        }
    }
}
module.exports = IDE;