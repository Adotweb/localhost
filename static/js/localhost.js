

let URI = ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/ws"

let socket = null;

let connectedServer = null

let id = Date.now()




async function get(route){
	const response = await fetch(route) 

	return await response.json()
}

async function post(route, body){


	const response = await fetch(route, {
	    headers: {
  	    		'Accept': 'application/json',
     			 'Content-Type': 'application/json'
	 	},
   	 	method: "POST",
    		body:JSON.stringify(body)
	})	

	return await response.json()
}

let rest = {
	get, 
	post
}



function send(data, addressList){
	socket.send(JSON.stringify({
		method:"client-ws",
		data:{
			...data, 
			addressList
		}	
	}))
}

function onmessage(func){
	socket.onmessage = (msg => {
	
		func(JSON.parse(msg.data).data)
	})	
}

function onopen(func){
	socket.onopen = func
}
function onclose(func){
	socket.onclose = func
}

let ws = {
	onopen,
	onmessage,
	send,
	onclose
}

function register(pid=false, url){
	socket = new WebSocket(url || URI)

	if(pid){
		id = pid
	}		

	socket.onopen = () => {

		let currentHost = window.location.pathname.split("/")[1];


		socket.send(JSON.stringify({
			method:"client-log",
		
			data:{
				id,
				currentHost	
			}			
		}))
	}

	socket.onmessage = msg => {
		msg = JSON.parse(msg.data);

		if(msg.data.registeredServer){
				
		}
	}

	socket.onclose = ( )=> {
		socket.send(JSON.stringify({

		}))
	}

}

let app = {
	rest,
	ws,
	register,
	id
}
