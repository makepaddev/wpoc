/**
 *
 */
class Animation extends require('./Base') {

    prototype() {
        super.prototype();
        if (this.hasOwnProperty('items') && this._items && this._items.length) {
            let arr = [];
            for (let i = 0, n = this._items.length; i < n; i++) {
                let action = AnimationAction.extend(this._items[i]);
                arr[i] = action;
            }
            this._items = arr;
        }
    }
}

module.exports = Animation;