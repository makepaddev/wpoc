class MainWidget extends require('../src/Widget') {

    properties() {
        this.dependencies = {
            'ButtonWidget': require('./ButtonWidget'),
            'TestWidget': {
                type: 'ButtonWidget', title: 'test',
                transitions: {x: {duration: 10}}
            }
        }

        var i = 1;

        this.annotations = {
            'width': {transition: true},
            'transition': {dynamic: true}
        };
    }

    onKeypress() {
        this.mytitle = "hello" + Math.random();
        this.rebuild();
    }

    build() {
        return {
            type: 'RectView', x: 10, y: 10, w: 50, h: 50, children: [
                {type: 'ButtonWidget', id: 'button', borderWidth: 10, title: this.mytitle},
                {id: 'btm', children: [
                    {type: 'ButtonWidget', id: 'button', borderWidth: 20, title: "hello " + this.mytitle}
                ]}
            ]
        };
    }

}

module.exports = MainWidget;