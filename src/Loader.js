(function() {
    Object.defineProperty(window,'_',{
        get:function(){},
        set:console.log.bind(console)
    })
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    var loadedSources = {};
    var modulePaths = {}
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
        watchFileChange()
        var relPath = buildBasePath(location.pathname);

        var cvs = document.getElementsByClassName('loader');
        for(var i =0; i < cvs.length; i++){
            var main = cvs[i].getAttribute('main');
            var modules = cvs[i].getAttribute('modules');
            if(modules){                
                var nmods = modules.split(',')
                for(var j = 0; j < nmods.length; j++){
                    var lbl = nmods[j].split(':')
                    modulePaths[lbl[0]] = lbl[1]
                }
            }
            var mainAbsPath = buildPath(main, relPath);
            (function(canvas) {
                loadJS(mainAbsPath).then(function() {
                    setTimeout(function() { // For debugging.
                        var require = makeRequire("/", {"canvas": canvas});
                        var main = require(mainAbsPath);
                        if(typeof main === 'function'){
                            new main(canvas)
                        }
                    }, 0);
                });
            })(cvs[i]);
        }
    }

    function watchFileChange(){
        var req = new XMLHttpRequest()
        req.timeout = 60000
        req.addEventListener("error", function(){
            setTimeout(watchFileChange, 500)
        })
        req.responseType = 'text'
        req.addEventListener("load", function(){
            if(req.response === '{continue:true}') return watchFileChange()
            if(req.status === 200){
            // do something with data, or not
                location.href = location.href
            }
        })
        req.open("GET", "/$watch?"+(''+Math.random()).slice(2))
        req.send()
    }


    function buildBasePath(path) {
        return path.slice(0, path.lastIndexOf('/') + 1);
    }

    var loadedModules = {};

    function makeDefine(require, exports, module){
        return function(body){
            body(require, exports, module)
        }
    }

    function makeRequire(basePath, module) {
        function require(path, asynccb) {
            if(Array.isArray(path) && asynccb){
                var arr = []
                for(var i = 0; i < path.length; i++){
                    var items = buildPath(path[i], basePath).split('!')
                    if(items.length>1){
                        arr.push(loadFileContents(items[items.length-1]))
                    }
                    else arr.push(loadJS(items[items.length-1]))
                }
                Promise.all(arr).then(function(){
                    setTimeout(function() { // For debugging.
                        var res = []
                        for(var i = 0; i < path.length; i++){
                            res.push(require(path[i]))
                        }
                        asynccb.apply(null,res)
                    },0)
                })
                return
            }

            var idx = path.indexOf('!')
            if(idx !== -1){
                var modulePath = buildPath(path.slice(idx+1), basePath);
                return loadedSources[modulePath]
            }
            
            var modulePath = buildPath(path, basePath);

            var m = loadedModules[modulePath];
            if (m) {
                return m.exports;
            }

            var source = loadedSources[modulePath];
            if(source === undefined) return undefined
            if (isChrome) {
                source = source.replace(/^\/\*([\S\s]*?)\*\//, function(m, matches) {
                    var lines = matches.split('\n');
                    if (lines.length <= 2) {
                        return m;
                    }
                    return "/*" + lines.slice(0, lines.length - 2).join("\n") + " */";
                });
            }

            try{
                var factory = new Function("require", "exports", "module", "define", source + "\n//# sourceURL=" + location.origin + modulePath + "\n");
            }
            catch(e){
                // if error insert as scripttag to get proper error in browser console
                var script = document.createElement('script')
                script.type = 'text/javascript'
                script.src = location.origin + modulePath
                document.getElementsByTagName('head')[0].appendChild(script)
                return
            }
            m = module || {};
            m.exports = {};
            var req = makeRequire(buildBasePath(modulePath))
            var def = makeDefine(req, m.exports, m)
            var ret = factory.call(m.exports, req, m.exports, m, def);
            if (ret !== undefined) {
                m.exports = ret;
            }

            loadedModules[modulePath] = m;

            return m.exports;
        }
        require.toUrl = function(path){
            return buildPath(path, basePath);
        }
        return require
    }

    function buildPath(path, parent){
        var mpath = modulePaths[path] // a plain modulepath resolve
        if(mpath) return mpath
        var s = path.lastIndexOf('/')
        var d = path.lastIndexOf('.')
        if(d === -1 || d < s) path = path + '.js'
        var a = path.charAt(0)
        var b = path.charAt(1)
        if(a === '/') return path
        if(a === '.'){
            while(a === '.'){
                if(b === '.'){
                    parent = parent.slice(0,parent.slice(0,-1).lastIndexOf('/'))
                    path = path.slice(3)
                    a = path.charAt(0)
                    b = path.charAt(1)
                }
                else{
                    parent = parent.slice(0,parent.lastIndexOf('/'))
                    path = path.slice(2)
                    a = path.charAt(0)
                    b = path.charAt(1)
                }
            }
            return parent + '/' + path
        }
        //if we dont have a path, we have to offset it to our modules
        var slash = path.indexOf('/')
        if(slash === -1) return '/' + path
        var mpath = modulePaths[path.slice(0,slash)]
        if(!mpath) return '/' + path
        return  mpath + path.slice(slash)
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
            code.replace(/require\s*\(\s*['"](.*?)['"]\s*\)/g, function(m, path){
                // if we have a ! we have a requirejs plugin
                var items = path.split('!')
                deps.push(loadJS(buildPath(items[items.length-1], basePath)));
            });

            return Promise.all(deps);
        });

        return pendingLoads[absPath];
    }

    document.addEventListener('DOMContentLoaded', init);
})();