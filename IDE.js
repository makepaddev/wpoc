
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor() {
        super();
        // lets get this widget in place
        new this.HtmlAce()

        // lets create the widgets
   }

    properties() {
        this.dependencies = {
            'HtmlAce': require('./app/HtmlAce')
        }
    }

    // prototyping build for Html UI
    build(){
        return { type:'Splitter', vertical:true, children:[
            {type:'HtmlAce'},
            {type:'div', style:'background-color:"red"'}
            ],
            type:'HtmlAce'
        }
        this.HtlmAce()
    }
}
module.exports = IDE;