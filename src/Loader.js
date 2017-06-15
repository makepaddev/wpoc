(function() {

    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    var loadedSources = {};

    function loadFileContents(absPath){
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest()
            xhr.addEventListener('error', function(){
                reject(xhr)
            })
            xhr.responseType = 'text'
            xhr.addEventListener('load', function(){
                if(xhr.status !==200) return reject(xhr);
                loadedSources[absPath] = xhr.response;
                resolve(xhr.response)
            })
            xhr.open('GET', location.origin + absPath)
            xhr.send()
        })
    }

    function init() {
        var relPath = buildBasePath(location.pathname);

        var cvs = document.getElementsByClassName('loader');
        for(var i =0; i < cvs.length; i++){
            var main = cvs[i].getAttribute('main');
            var mainAbsPath = buildPath(main, relPath);
            (function(canvas) {
                loadJS(mainAbsPath).then(function() {
                    setTimeout(function() { // For debugging.
                        var require = makeRequire("/", {"canvas": canvas});
                        require(mainAbsPath);
                    }, 0);
                });
            })(cvs[i]);
        }
    }

    function buildBasePath(path) {
        return path.slice(0, path.lastIndexOf('/') + 1);
    }

    var loadedModules = {};
    function makeRequire(basePath, module) {
        return function require(path) {
            var modulePath = buildPath(path, basePath);
            var m = loadedModules[modulePath];
            if (m) {
                return m.exports;
            }

            var source = loadedSources[modulePath];
            if (isChrome) {
                source = source.replace(/^\/\*([\S\s]*?)\*\//, function(m, matches) {
                    var lines = matches.split('\n');
                    if (lines.length <= 2) {
                        return m;
                    }
                    return "/*" + lines.slice(0, lines.length - 2).join("\n") + " */";
                });
            }

            var factory = new Function("require", "exports", "module", source + "\n//# sourceURL=" + location.origin + modulePath + "\n");
            m = module || {};
            m.exports = {};

            var ret = factory.call(m.exports, makeRequire(buildBasePath(modulePath)), m.exports, m);
            if (ret !== undefined) {
                m.exports = ret;
            }

            loadedModules[modulePath] = m;

            return m.exports;
        }
    }

    function buildPath(path, parent){
        //if(!path || !path.lastIndexOf) return console.log(new Error("").stack)
        var s = path.lastIndexOf('/')
        var d = path.lastIndexOf('.')
        if(d === -1 || d < s) path = path + '.js'
        var a = path.charAt(0)
        var b = path.charAt(1)
        if(a === '/') return path//path.slice(1)
        if(a === '.'){
            let out;
            if (b == '.') {
                out = parent + path;
            } else {
                out = parent.slice(0,parent.lastIndexOf('/')) + path.slice(1)
            }
            return out
        }
        return '/' + path
    }

    var pendingLoads = {};

    function loadJS(absPath) {
        if (pendingLoads[absPath]) {
            return pendingLoads[absPath];
        }

        var basePath = buildBasePath(absPath);

        pendingLoads[absPath] = loadFileContents(absPath).then(function(source) {
            var code = source.replace(/\/\*[\S\s]*?\*\//g,'').replace(/\/\/[^\n]*/g,'')

            var deps = [];
            code.replace(/require\s*\(\s*['"](.*?)['"]/g, function(m, path){
                var path = buildPath(path, basePath);
                deps.push(loadJS(path));
            });

            return Promise.all(deps);
        });

        return pendingLoads[absPath];
    }

    document.addEventListener('DOMContentLoaded', init);
})();