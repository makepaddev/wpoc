// devserver is MIT licensed, copyright Makepad
"use strict" 
var Https = require('https')
var Http = require('http')
var Fs = require('fs')
var Url = require('url')
var Os = require('os')
var NodeWebSocket = require('./devwebsocket')
var server_port = 2002
var server_interface = '127.0.0.1'

var mimetable = {
	'.map':'application/json',
	'.html':'text/html',
	'.js':'application/javascript',
	'.ico':'image/x-icon'
}

var watchresponses = []
var watchfiles = {}
var tags = {}

function pollWatchlist(){
	var promises = []
	for(let filename in watchfiles){

		promises.push(new Promise(function(resolve, reject){
			Fs.stat(filename, function(filename, err, stat){
				//console.log(filename)
				resolve({
					filename: filename, 
					stat: stat
				})
			}.bind(null, filename))
		}))
	}
	Promise.all(promises).then(function(results){
		var filechanges = []
		for(let i = 0; i < results.length; i++){
			var result = results[i]
			result.stat.atime = null
			result.stat.atimeMs = null
			var newtag = JSON.stringify(result.stat)
			var oldtag = tags[result.filename]
			if(oldtag === -1) continue
			if(!oldtag) oldtag = tags[result.filename] = newtag

			if(oldtag !== newtag){
				tags[result.filename] = newtag
				filechanges.push(result.filename.slice(httproot.length))
			}
		}
		if(filechanges.length){ // signal all listeners
			for(let i = 0; i < watchresponses.length; i++){
				var res = watchresponses[i]
				res.writeHead(200, {'Content-type':'text/json'})
				res.end(JSON.stringify(filechanges))
			}
		}
		setTimeout(pollWatchlist, 100)
	})
}

var httproot = process.cwd()

function requestHandler(req, res){
	var host = req.headers.host
	var url = req.url
	var parsed = Url.parse(url)
	
	var filename = parsed.pathname
	if(filename === '/') filename = '/index.html'

	if(filename === '/$watch'){
		// keep it pending
		res.on('close', function(){
			var idx = watchresponses.indexOf(res)
			if(idx !== -1) watchresponses.splice(idx, 1)
		})
		setTimeout(function(){
			res.writeHead(200,{'Content-Type':'text/json'})
			res.end("{continue:true}")
		}, 50000)
		watchresponses.push(res)
		return
	}

	// return filename 
	var fileext = ((filename.match(/\.[a-zA-Z0-9]+$|\?/) || [''])[0]).toLowerCase()
	if(!fileext) fileext = '.html', filename += '.html'
	var filemime = mimetable[fileext] || 'application/octet-stream'

	if(filename.match(/\.\./)){
		res.writeHead(404)
		res.end()
		return 
	}
	if(filename.indexOf('//')!==-1)console.log(filename, "HUH!")
	// lookup filename
	var filefull = httproot + filename

	// file write interface
	if(req.method == 'POST'){
		if(req.connection.remoteAddress !== '127.0.0.1' ) {
			res.writeHead(404)
			res.end()
			return 
		}
		var buf = new Uint8Array(req.headers['content-length'])
		var off = 0
		req.on('data', function(data){
			for(let i = 0; i < data.length; i ++, off++){
				buf[off] = data[i]
			}
		})
		req.on('end', function(){
			// lets write it
			tags[filefull]=-1
			Fs.writeFile(filefull, Buffer(buf), function(err){
				if(err){
					console.log("Error saving ", filefull)
					res.writeHead(500)
					res.end("")
					return
				}
				console.log("saved "+filefull)
				tags[filefull]=undefined

				res.writeHead(200)
				res.end()
			})
		})
		return
	}

	// stat the file
	Fs.stat(filefull, function(err, stat){
		if(err || !stat.isFile()){
			res.writeHead(404,{'Content-Type':'text/html'})
			res.end('File not found')
			return
		}

		// lets check the etag
		var etag = stat.mtime.getTime() + '_' + stat.size
		if(req.headers['if-none-match'] === etag){
			res.writeHead(304)
			res.end()
			return
		}

		// mark as watched
		watchfiles[filefull] = true
		// now send the file
		var stream = Fs.createReadStream(filefull)
		res.writeHead(200, {
			"Connection": "Close",
			"Cache-control": 'max-age=0',
			"Content-Type": filemime,
			'Content-Length':stat.size,
			"etag": etag,
			"mtime": stat.mtime.getTime()
		})
		stream.pipe(res)
	})
}

try{
	// simple https test certificates to test getUserMedia, google how to create / set up a self signed https cert for node.js
	const options = {
		key: Fs.readFileSync('./devserver-key.test'),
		cert: Fs.readFileSync('./devserver-cert.test')
	}
	var server = Https.createServer(options, requestHandler)
} 
catch(x){
	var server = Http.createServer(requestHandler)
}

if(process.argv.length === 3){
	var hostModule = require(process.argv[2])
}

server.on('upgrade', function(request, socket, header){
	var sock = new NodeWebSocket(request, socket, header)
	if(hostModule) hostModule(sock)
})

server.listen(server_port, server_interface, function(err){
	if (err) {
		return console.log('Server error ', err)
	}
	// dump what we are listening on
	var interfaces = Os.networkInterfaces()
	for(let ifacekey in interfaces){
		var iface = interfaces[ifacekey]
		for(let i = 0; i < iface.length; i++){
			var subiface = iface[i]
			if(subiface.family !== 'IPv4') continue
			if(server_interface === '0.0.0.0' || server_interface == subiface.address){
				console.log('Server is listening on http://'+subiface.address+':'+server_port+'/')
			}
		}
	}
	// start the filewatcher
	pollWatchlist()
})