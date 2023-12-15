const {createServer} = require("http");
const express = require("express");
const app = express();

const {WebSocketServer} = require("ws");
const path = require("path");

const {client} = require("./db/client")

const httpServer = createServer(app)

const wss = new WebSocketServer({server:httpServer})


const {v4} = require("uuid")


require("dotenv").config()

const PORT = process.env.PORT || 5000


let servers = new Map();
let clients = new Map();


wss.on("connection", socket => {

	socket.on("message", async msg => {
		msg = msg.toString();

		const {method, data} = JSON.parse(msg);

			
		if(!data) return


		switch(method){

			case "client-log":
			
				if(!data.hasOwnProperty("id")) break;
				
				clients.set(data.id, socket);
				socket.id = data.id;


				break; 

			case "server-log":


				if(!data.hasOwnProperty("id") || !data.hasOwnProperty("secret")) break;

			
				let db = client.db("localhost");
				let collection = db.collection("app_ids"); 


				

				let results = await collection.findOne({
					server_id:data.id
				})



				if(!results) break;
				

				if(data.secret !== results.secret) break;



				servers.set(data.id, socket);
				socket.id = data.id	


				break;

			case "client-req": 
				
				if(!data.hasOwnProperty("targetId")) break

				if(servers.has(data.targetId)){

					let serving = servers.get(data.targetId)

					serving.send(JSON.stringify({
						method:"client-req",
						data
					}))

				}else {
					socket.send(JSON.stringify({
						method:"error", 
						data:{
							message:"no server with the speficified id"
						}
					}))
				}

				break;
			
			case "server-res":

					

				if(data.requestid){
					let res = stalledResponses.get(data.requestid);

					if(data.response.err == 404){
						res.sendFile(path.join(__dirname, "static", "notFound.html"))

						break;
					}	

					res.send(data.response) 
				}
					
				if(clients.has(data.address)){
					let addressed = clients.get(data.address)



					if(!addressed) return

					addressed.send(JSON.stringify({
						method:"task",
						data
					}))
				}


				break;

			case "server-int":

				break;

			case "keepalive":
				
				socket.send(JSON.stringify({
					method:"keepalive",
					data:{}
				}))

				break;
		}
	})


	socket.on("close", e => {
		let id = socket.id;

		if(clients.has(id)){
			clients.delete(id)
		}
		if(servers.has(id)){
			servers.delete(id)
		}
		


	})
})



app.use(express.static(path.join(__dirname, "/static")))




let stalledResponses = new Map()

app.get("/:serverid", (req, res) => {
	let {serverid} = req.params;


	if(servers.has(serverid)){
		let requestid = v4();

		let serving = servers.get(serverid);

		let requestObject = {
			params:req.params		
		}

		

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"get",
				route:"/", 
				requestid,
				request:requestObject
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}
})

app.get("/:serverid/:route", (req, res)=> {
	let {serverid,route} = req.params;

	route = "/" + route;


	if(servers.has(serverid)){
		
		let requestid = v4();
		
		let requestObject = {
			params:req.params
		}

		let serving = servers.get(serverid)

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"get",
				route,
				requestid,
				request:requestObject	
			}
		}))

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))	
	}
})

app.post("/:serverid/:route", (req, res) => {
	let {serverid, route} = req.params;

	let body = req.body;


	if(servers.has(serverid)){
		let requestid = v4();

		let requestObject = {
			body,
			params:req.params
		}

		let serving = servers.get(serverid); 

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"",
				request:requestObject,
				requestid, 
				route
			}
		}))

		stalledResponses.set(requestid, res)
	}else {
		res.send({err:"currently no such host"})	
	}
})

app.post("/task/:serverid/:route", (req, res) => {
	let {serverid, route} = req.params; 
	

	let body = req.body

	let address = body.address;

	if(!address) {
		res.send({err:"no address provided"})
		return	
	}

	if(servers.has(serverid)){

		let requestObject = {
			body,
			params:req.params
		}

		let serving = servers.get(serverid);

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"task",
				request:requestObject,
				route,
				address
			}
		}))
	} else{
		res.send({err:"currently no such hosts"})
	}
})




app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "static", "notFound.html"))
})

httpServer.listen(PORT)
