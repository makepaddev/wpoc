var View = require('./View');
var Widget = require('./Widget');

class App extends Widget {

    constructor(canvas) {
        super();

        this.stage = new Stage({canvas: canvas});

        this.fullBuild();
    }

    fullBuild() {
        var template = this.build();
        this.view = this._buildVisit(this, this.stage.root, template, true);
    }

    _buildVisit(widget, targetView, obj, templateRoot) {

        if (Utils.isObjectLiteral(obj)) {
            var id = obj.id;
            if (!id || !Utils.isString(id)) {
                console.error('ID is undefined');
                return null;
            }

            // View corresponds to a widget.
            var targetWidget = targetView && targetView.widget;

            var type = obj.type || 'View';

            var constructor = widget[type];

            if (!targetWidget && (targetView !== constructor)) {
                // Changed type to other view or widget: rebuild.
                targetView = null;
            }
            if (targetWidget && (targetWidget !== constructor)) {
                // Changed type to other widget or view: rebuild.
                targetWidget = null;
                targetView = null;
            }

            if (!targetView) {
                if (constructor.prototype.__isWidget__) {
                    if (templateRoot) {
                        console.error('Template root must refer to a View type.');
                        return null;
                    }
                    targetWidget = new constructor(this);
                } else if (constructor.prototype.__isView__) {
                    targetView = new constructor(this.stage);
                } else {
                    console.error('Type must refer to Widget or View class: ' + id);
                    return null;
                }
            }

            if (targetWidget) {
                // Set widget properties.
                for (var key in obj) {
                    //@todo: remember dependency properties.

                    targetWidget[key] = obj[key];
                }

                // Build widget and save view for next time.
                targetView = targetWidget.view = this._buildVisit(targetWidget, targetWidget.view, targetWidget.build(), false);
                targetWidget.view.widget = targetWidget;
            } else if (targetView) {
                for (var key in obj) {
                    if (key === 'children') {
                        continue;
                    }

                    //@todo: remember dependency properties.

                    targetView[key] = obj[key];
                }

                // Handle children.
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
                        if (!childIds) childIds = targetView.childIds = {};
                        let childTargetView = childIds[id];
                        for (let i = 0, n = children.length; i < n; i++) {
                            var view = this._buildVisit(widget, childTargetView, children[i], false);
                            if (view) {
                                fullMatch = fullMatch && (oldChildren[i] === view);
                                newChildren.push(view);
                                newChildIds[obj.id] = view;
                            } else {
                                fullMatch = false;
                            }
                        }
                    }
                    if (!fullMatch) {
                        targetView.setChildren(newChildren, newChildIds);
                    }
                }
            }

            return targetView;
        } else {
            if (!obj.__isWidget__) {
                console.error('Element must be a literal object or widget instance');
                return null;
            }

            obj.view = this._buildVisit(obj, obj.view, obj.build(), true);

            return obj.view;
        }
    }


}

module.exports = App;