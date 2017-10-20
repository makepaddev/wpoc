console.log("I started")

window.addEventListener('message', function(msg){
	document.body.innerHTML += '<div>Received from parent: '+JSON.stringify(msg.data)+"</div>"
	// posting to parent
	window.parent.postMessage("Hi from iframe","*")
})

document.addEventListener('DOMContentLoaded', function(){
	// test infinite loop
	setTimeout(function(){
		//while(1);
	},100)
})
//while(1)
//document.body.innerHTML="<div>Hello</div>"