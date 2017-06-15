/**
 *
 */
var TwitchApp = require('./app/TwitchApp');
var app = new TwitchApp(module.canvas);

app.updateBuild();

console.log(app._view);
app.mainWidget.rebuild();

app.updateBuild();