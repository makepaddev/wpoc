/**
 *
 */
class View extends require('./Base') {

    constructor(stage) {
        super();
        this.stage = stage;
    }

    properties() {
        this.__isView__ = true;

        this._parent = null;
        this._childIds = null;
        this._children = null;
        this._texture = null;
        this._widget = null;
    }


    setChildren(children, childIds) {
        // @todo:
        // make sure that current children that are not in new children are removed.
        // make sure that new children are added
        // make sure that positions are changed if necessary.
        this._children = children;
        this._childIds = childIds;

        //@todo: set parent.
    }

    update() {

    }

    drawToVbo() {

    }

    setTexture(texture) {
        this._texture = texture;
    }

}

module.exports = View;