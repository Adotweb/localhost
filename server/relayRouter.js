const { Try, decycle } = require("../utils/utils")
const { loginHost } = require("./hosts/hostChecks")
const { wss } = require("./server")
const crypto = require("crypto")
const relayRouter = require("express").Router()


const { CheckSchema, RelayMessageSchema, MessageSchema, HostLoginSchema, RestResponseSchema } = require("../schemas/relaySchema")
const { ZodError } = require("zod")



const connections = new Map()

const stalledRequests = new Map()

wss.on("connection", socket => {

	socket.sendJSON = json => socket.send(JSON.stringify(json))
	socket.sendError = error => { 
		socket.send(JSON.stringify({
			...error, 
			closing:true
		}))
		socket.close()
	}

	socket.on("message", async msg => {


		try{	
			const body = JSON.parse(msg.toString())

			const { sender, method, data } = MessageSchema.parse(body)

			if(method === "login"){
				
				socket.wsId = socket.wsId || data.id || data.hostId || crypto.randomUUID()


				if(sender === "host"){
					
					HostLoginSchema.parse(body)

					loginHost(body.hostId, body.hostSecret)	

				}

				if(connections.has(socket.wsId)){
					throw ({
						error:"Id already exists!"
					})
				}	

				connections.set(socket.wsId, socket)

				console.log(connections.keys())

			}

			if(method === "message"){

				RelayMessageSchema.parse(body)


				data.receiverList.forEach(receiver => {
					if(!connections.has(receiver)) {return}	
					connections.get(receiver).sendJSON(body)
				})

			}


			if(method === "keepalive"){
				if(socket.type === "host"){
					socket.sendJSON({
						method:"keepalive"
					})	
				}else{

					throw({
						error:"only hosts can use keepalive"
					})
				}

			}

			if(method === "restResponse"){
				RestResponseSchema.parse(body)

				const res = stalledRequests.get(data.requestId)
		
				data.meta.headers.forEach(({headerName, headerValue}) => res.header(headerName, headerValue))

				res.status(data.meta.status)
				if(data.meta.redirect){
					res.redirect(data.meta.redirect)
				}
				if(data.body){
					res.send(data.body)
				}
				

			}

		}


		catch(error){

			console.log(error)
			if(error instanceof ZodError){
				error = error.issues.map(({message, path}) => ({message, field:path.join(">")}))
			} 
			if(error instanceof Error){
				error = error + ""
			}

			socket.sendError({
				error
			})
			socket.close()
			return
		}
	})


	socket.on("close", () => {
		connections.delete(socket.wsId)	
		console.log(connections)
	})		
		

})


const RestRelay = (req, res) => {
	

	let requestId = crypto.randomUUID();

	while(stalledRequests.has(requestId)){
		requestId = crypto.randomUUID()
	}

	let requestObject = decycle(req)

	let host = req.originalUrl.split("/")[2] 


	if(!connections.has(host)){
		res.status(400).send({
			error:"no such host registered"
		})
	} 

	stalledRequests.set(requestId, res)
	connections.get(host).sendJSON({
		requestId, 
		requestObject
	})



}


relayRouter.get("*", RestRelay)
relayRouter.post("*", RestRelay)

module.exports = relayRouter
