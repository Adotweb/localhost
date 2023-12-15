

let URI = ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/ws"

let socket = new WebSocket(URI);


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

const onopen = socket.onopen
const onclose = socket.onclose

let ws = {
	onopen,
	onmessage,
	send,
	onclose
}

function register(url, pid=false){
	socket = new WebSocket(url || URI)

	if(pid){
		id = pid
	}		

	socket.onopen = () => {
		socket.send(JSON.stringify({
			method:"client-log",
		
			data:{
				id
			}			
		}))
	}

	socket.onmessage = msg => {
		console.log(msg)
	}

}

let app = {
	rest,
	ws,
	register,
	id
}
