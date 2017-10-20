console.log("I started")

document.addEventListener('DOMContentLoaded', function(){
	console.log("Hi, im going into an infinite loop")
	setTimeout(function(){
		while(1);
	},100)
})
//while(1)
//document.body.innerHTML="<div>Hello</div>"

