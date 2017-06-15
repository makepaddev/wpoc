/**
 * Root widget.
 */

var View = require('./View');
var Widget = require('./Widget');
var Stage = require('./Stage');
var Utils = require('./Utils');

class App extends Widget {

    constructor(canvas) {
        super();
        this.stage = new Stage({canvas: canvas});
    }

    updateBuild() {
        // Build context.
        this.buildContext = {loc: [], ids: []};

        this._pushBuildContext(this);
        this._buildWidget(this);
        this._popBuildContext();

        if (!this.stage.root._children || this.stage.root._children[0] !== this._view) {
            this.stage.root.setChildren([this._view], null);
        }
    }

    _pushBuildContext(obj, id) {
        this.buildContext.loc.push(obj);
        this.buildContext.ids.push(id);
    }

    _popBuildContext() {
        this.buildContext.loc.pop();
        this.buildContext.ids.pop();
    }

    _buildWidget(widget) {
        if (widget._hasRebuilds) {
            var orig = this.buildContext.widget;
            this.buildContext.widget = widget;

            if (widget._mustRebuild) {
                var obj = widget.build();

                if (Utils.isObjectLiteral(obj)) {
                    if (obj.type) {
                        var type = widget[obj.type];
                        if (!type || !type.prototype.__isView__) {
                            throw this._getBuildError("Widget template root must refer to a view type.");
                        }
                    }

                    widget._view = this._buildPlainObject(obj, widget._view);
                    widget._view._widget = widget;
                } else {
                    if (!obj || !obj.__isView__) {
                        throw this._getBuildError("Widget template root must refer to a View.");
                    }

                    widget._view = obj;
                    widget._view._widget = widget;
                }

                widget._mustRebuild = false;
            } else {
                this._checkRebuild(widget._view);
            }

            this.buildContext.widget = orig;

            widget._hasRebuilds = false;
        }

        return widget._view;
    }

    _checkRebuild(view) {
        var children = view._children;
        for (var i = 0, n = children.length; i < n; i++) {
            var child = children[i];
            this._pushBuildContext(child);
            var widget = child._widget;
            if (widget) {
                this._buildWidget(widget);
            } else {
                this._checkRebuild(view);
            }
            this._popBuildContext();
        }
    }

    _buildPlainObject(obj, targetView) {
        // View corresponds to a widget.
        var targetWidget = targetView && targetView._widget;

        var type = obj.type || 'View';

        var constructor = this.buildContext.widget[type];
        if (!constructor || !constructor.prototype) {
            throw this._getBuildError("Unknown dependency: " + type);
        }

        if (!targetWidget && targetView && (targetView.prototype.constructor !== constructor)) {
            // Changed type to other view or widget: rebuild.
            targetView = null;
        }
        if (targetWidget && (targetWidget.prototype.constructor !== constructor)) {
            // Changed type to other widget or view: rebuild.
            targetWidget = null;
            targetView = null;
        }

        if (!targetView) {
            if (constructor.prototype.__isWidget__) {
                targetWidget = new constructor(this);
            } else if (constructor.prototype.__isView__) {
                targetView = new constructor(this.stage);
            } else {
                throw this._getBuildError("type must refer to Widget or View class");
            }
        }

        if (targetWidget) {

            this._pushBuildContext(targetWidget, obj.id);

            // Set widget properties.
            for (var key in obj) {
                if (key == 'type' || key == 'id') {
                    continue;
                }

                //@todo: remember dependency properties.

                targetWidget[key] = obj[key];
            }

            // Build widget and save view for next time.
            targetView = this._buildWidget(targetWidget);
            this._popBuildContext();
        } else if (targetView) {

            this._pushBuildContext(targetView, obj.id);

            // Set View properties.
            for (var key in obj) {
                if (key === 'children' || key == 'type' || key == 'id') {
                    continue;
                }

                //@todo: remember dependency properties.

                targetView[key] = obj[key];
            }


            // Process children.
            let newCount = (obj.children && obj.children.length) || 0;
            let oldCount = (targetView._children && targetView._children.length) || 0;
            if (newCount || oldCount) {
                let oldChildren = targetView._children;
                let children = obj.children;
                let newChildren = [];
                let newChildIds = {};
                let fullMatch = (oldCount === newCount);
                let childIds = targetView.childIds;
                if (children) {
                    if (!childIds) childIds = targetView._childIds = {};
                    for (let i = 0, n = children.length; i < n; i++) {
                        let resultView;

                        let obj = children[i];
                        let id;
                        if (Utils.isObjectLiteral(obj)) {
                            id = obj.id;

                            if (!id || !Utils.isString(id)) {
                                throw this._getBuildError("ID is undefined for child " + i);
                            }

                            let childTargetView = childIds[id];
                            resultView = this._buildPlainObject(obj, childTargetView);
                        } else if (obj && obj.__isWidget__) {
                            resultView = this._buildWidget(obj);
                        } else if (obj && obj.__isView__) {
                            resultView = obj;
                        } else {
                            throw this._getBuildError("Unknown type for child " + i);
                        }

                        if (resultView) {
                            fullMatch = fullMatch && (oldChildren[i] === resultView);
                            newChildren.push(resultView);

                            if (id) {
                                resultView.id = id;
                                newChildIds[id] = resultView;
                            }
                        } else {
                            fullMatch = false;
                        }
                    }
                }
                if (!fullMatch) {
                    targetView.setChildren(newChildren, newChildIds);
                }
            }

            this._popBuildContext();
        }


        return targetView;
    }

    _getBuildError(message) {
        let str = "";
        for (let i = 0, n = this.buildContext.loc.length; i < n; i++) {
            let id = this.buildContext.ids[i] || this.buildContext.loc[i].id;
            str += "." + this.buildContext.loc[i].constructor.name + (id ? "[" + id + "]" : "");
        }
        return new Error(message + " in '" + str.substr(1) + "'");
    }


}

module.exports = App;