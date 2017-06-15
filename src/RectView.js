/**
 *
 */
class RectView extends require('./View') {
    constructor(stage) {
        super(stage);
        this.setTexture(stage.rectTexture);
    }
}

module.exports = RectView;