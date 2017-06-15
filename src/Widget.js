/**
 * Defines a coherent part of the app.
 */

let Utils = require('./Utils');

var Base = require('./Base');

class Widget extends Base {

    constructor(app) {
        this.app = app;
        super();
    }

    properties() {
        this.__isWidget__ = true;

        this.view = null;
        this.mustRebuild = true;
        this.hasRebuilds = true;

        this.inheritable('dependencies', function () {
            let deps = this.dependencies;

            function processDep(key, dep){
                if(Utils.isObjectLiteral(dep)){
                    if(dep.type){
                        if(!this[dep.type]) throw new Error('Type does not exist: ' + dep.type);
                        this[key] = this[dep.type].extend(dep);
                    }
                    else{
                        if(!this[key]) throw new Error('Subclass has no baseclass: ' + key);
                        this[key] = this[key].extend(dep);
                    }
                }
                else{
                    this[key] = dep
                }
            }

            for (let key in deps) {
                let dep = deps[key];

                function makeInheritable(key) {
                    this.inheritable(key, function () {
                        processDep.call(this, key, this[key])
                    })
                }

                if(!this.__inheritables__[key]) makeInheritable.call(this, key);

                processDep.call(this, key, dep)
            }
        })

        this.dependencies = {
            'Animation': require('./Animation'),
            'View': require('./View'),
            'RectView': require('./RectView')
        };
    }

    rebuild() {
        this.mustRebuild = true;
        let p = this.view.parent;
        while (p) {
            let widget = p.widget;
            if (widget !== undefined) {
                if (widget.hasRebuilds) {
                    break;
                } else {
                    widget.hasRebuilds = true;
                }
            }
            p = p.parent;
        }
    }

    build() {
        return {};
    }

    set id(v) {
        this.view.id = v;
    }

}

module.exports = Widget;