/**
 * HTML Editor wrapping Ace and a button bar
 */

var jsParser = require('../acorn/js')

class HtmlEditor extends require('../src/HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            Ace:require('./HtmlAce').extend({
                onCleanChange(clean){
                    this.parentWidget.onCleanChange(clean)
                },
                onFileChange(contents){
                    this.parentWidget.onFileChange(contents)

                    jsParser.parse(contents, {allowReturnOutsideFunction:true})
                },
                onSave(text){
                    this.parentWidget.onSave(text)
                }
            }),
            EditBar:{
                backgroundColor:'#222',
                type:'View',
                paddingTop:'5px',
                paddingLeft:'5px',
                paddingRight:'5px',
                height:'1.9em'
            },
            EditContainer:{
                type:'View',
                height:'calc(100% - 2em)',
            },
            CloseButton:require('./HtmlButton').extend({
                icon:'close',
                Bg:{
                    float:'right'
                }
            }),
            PlayButton:require('./HtmlButton').extend({
                icon:'play',
                onClick(){
                    
                },
                Bg:{
                    paddingLeft:'5px',
                    paddingRight:'4px',
                    float:'left'
                }
            })
        }
    }

    onCleanChange(clean){
    }

    onFileChange(contents){

    }

    onTabFocus(){
        this.childViewByType('EditContainer').childWidgetByType('Ace').onTabFocus()
    }

    build(){
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
                {type:'EditBar', children:[
                    {type:'CloseButton'},
                    {type:'PlayButton'}
                ]},
                {type:'EditContainer',children:[{
                    file:this.file,
                    type:'Ace'
                }]}
            ]
        }
    }
}

module.exports = HtmlEditor
;