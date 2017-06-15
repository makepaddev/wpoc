/**
 *
 */
class ButtonWidget extends require('./Widget') {

    constructor() {
        super();
    }

    properties() {
        this.dependencies = {
            'BorderWidget': require('./BorderWidget')
        }

        var i = 1;

        this.annotations = {
            'title': {rebuild: true}
        };
    }

    // set title(v) {
    //     this._title = v;
    // }
    //
    // get title {
    //     return this._title;
    // }
    //
    build() {
        return {
            type: 'RectView', id: 'wrap', x: 0, y: 0, children: [
                {type: 'RectView', id: 'title', x: 10, y: 10, text: this.title}
            ]
        };
    }
}

module.exports = ButtonWidget;