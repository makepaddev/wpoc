/**
 * Provides an app for the Twitch streaming service.
 */

var App = require('../src/App');
class TwitchApp extends App {

    constructor(canvas) {
        super(canvas);

        // We need the main widget.
        var MainWidget = require('./MainWidget');
        this.mainWidget = new MainWidget(this);

        var video = document.getElementById('video');
        if (!video) {
            throw new Error("Can't find video player.")
        }
    }

    properties() {
        this.dependencies = {
            'MainWidget': require('./MainWidget')
        }
    }

    playVideo(src) {
        // External utility function.
        video.src = src;
        video.play();
    }

    build() {
        return {
            type: 'RectView', id: 'main', color: 0xFFFF0000, x: 0, y: 0, w: 500, h: 500, children: [
                this.mainWidget,
                {type: 'RectView', id: 'bottom', color: 0xFFFFFFFF, x: 0, y: 500, mountY: 1, w: 500, h: 100}
            ]
        };
    }
}

module.exports = TwitchApp;