var loaderApi
window.addEventListener('message', function(event){
	var msg = event.data
	// lets boot up the app with js from the message
	if(msg.cmd === 'boot'){
		// reuse Loader.js as our module loader for the worker
		var loader = new Function('return '+msg.loader)()
		loaderApi = loader({
			loadFile(absPath){
				return new Promise(function(resolve, reject){
					if(!msg.modules[absPath]) reject(absPath)
					resolve(msg.modules[absPath])
				})
            }
		})
		loaderApi.boot(msg.main)
	}
	if(msg.cmd === 'hotReload'){
		loaderApi.reload(msg.file, msg.contents)
	}
})

document.addEventListener('DOMContentLoaded', function(){
	window.parent.postMessage({cmd:'booted'},"*")
})
