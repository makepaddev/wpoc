/**
 * The main HTML Widget
 */

let Utils = require('./Utils');
var Widget = require('./Widget');

class HtmlWidget extends require('./Base') {

    constructor(parent, props) {
        super();
        for(var key in props){
            this[key] = props[key]
        }
    }

    properties() {
    	this.inheritable('dependencies', require('./dependencies'));
    	this.dependencies = {
    		View:require('./HtmlView'),
            Icon:require('./HtmlIcon'),
            Text:require('./HtmlText')
    	}

        this.inheritable('states', function(){
            // flip states to targetted view classes
            this._states = Object.create(this._states || null)
            var outputDeps = {}
            for(var stateName in this.states){
                var inputDeps = this.states[stateName]
                this._states[stateName] = inputDeps
                // invert the subs
                for(var inputName in inputDeps){
                    var inputDep = inputDeps[inputName]
                    var outputDep = outputDeps[inputName]
                    if(!outputDep) outputDep = outputDeps[inputName] = {}
                    var outputState = outputDep[stateName]
                    if(!outputState) outputState = outputDep[stateName] = {}
                    for(var prop in inputDep){
                        outputState[prop] = inputDep[prop]
                    }
                }
            }
            for(var depClass in outputDeps){
                this[depClass] = this[depClass].extend({
                    states:outputDeps[depClass]
                })
            }
        })
        this.__isWidget__ = true;
        this.state = ''
    }

    // recursively set a state on a widget
    _setState(state, htmlView){
        htmlView.setState(state)
        var cn = htmlView.domNode.childNodes
        for(var i = 0; i < cn.length; i++){
            var childView = cn[i].$vnode
            if(!childView) continue
            if(childView.widget === this){
                this._setState(state, childView)
            }
        }
    }

    setState(state){
        this.state = state
        this._setState(state, this.view)
    }

    parentWidgetByType(type){
        return this.view.parentWidgetByType(type)
    }

    parentViewByType(type){
        return this.view.parentWidgetByType(type)
    }

    childWidgetByType(type){
        return this.view.childWidgetByType(type)
    }

    childViewByType(type){
        return this.view.childViewByType(type)
    }

    childViews(){
        return this.view.childViews()
    }
    
    childWidgets(){
        return this.view.childWidgets()
    }
    
    rebuild() {
        this.app._addRebuild(this)
    }

    setFocus(){
        if(this.app.$focus && this.app.$focus.onBlur){
            this.app.$focus.onBlur()
        }
        this.app.$focus = this
        if(this.app.$focus && this.app.$focus.onFocus){
            this.app.$focus.onFocus()
        }
    }

    hasFocus(){
        return this.app.$focus === this
    }
}

module.exports = HtmlWidget;