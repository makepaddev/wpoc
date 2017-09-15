
var HtmlApp = require('./src/HtmlApp');

class IDE extends HtmlApp {

    constructor(domNode) {
        super(domNode);
        // alright lets create a HtmlDock
        // load the project.
        require(['text!/project.json'], result=>{
            var layout = JSON.parse(result)
            // rebuild the dock from project
            var dock = this.childWidgetByType('Dock')
            dock.data = layout
            dock.rebuild()
        })
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
            type:'Dock'
        }
    }
}
module.exports = IDE;