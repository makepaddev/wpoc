/**
 * Defines a coherent part of the app.
 */

let Utils = require('./Utils');
var Base = require('./Base');

class Widget extends Base {

    constructor(app) {
        super();
        this.app = app;
    }

    properties() {
        this.__isWidget__ = true;

        this._view = null;
        this._mustRebuild = true;
        this._hasRebuilds = true;

        this.inheritable('dependencies', require('./dependencies'));

        this.dependencies = {
            'Animation': require('./Animation'),
            'View': require('./View'),
            'RectView': require('./RectView')
        };
    }

    rebuild() {
        this._mustRebuild = true;
        let p = this.view._parent;
        while (p) {
            let widget = p._widget;
            if (widget !== undefined) {
                if (widget._hasRebuilds) {
                    break;
                } else {
                    widget._hasRebuilds = true;
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