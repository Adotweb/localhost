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

	socket.on("message", msg => {
		msg = msg.toString();

		const {method, data} = JSON.parse(msg);

			


		switch(method){

			case "client-log":
			
				
				clients.set(data.id, socket);
				socket.id = data.id;


				break; 

			case "server-log":


				servers.set(data.id, socket);
				socket.id = data.id	


				break;

			case "client-req": 

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
					res.send(data.response)
				}

				if(clients.has(data.address)){
					let addressed = clients.get(data.address)



					addressed.send(JSON.stringify({
						method:"server-res",
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
			clients.delete(id)
		}
		


	})
})



app.use(express.static(path.join(__dirname, "/static")))


let stalledResponses = new Map()

app.get("/apps", async (req, res) => {
	const localhost = client.db("localhost")
	const collection = localhost.collection("app_ids")

	const result = await collection.findOne()

	res.send(result)	
})

app.get("/:serverid/:getter", (req, res) => {

	let {serverid, getter} = req.params
	

	if(servers.has(serverid)){
		
		let requestid = v4();


		let serving = servers.get(serverid)

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				getter,
				requestid
			}
		}))

		stalledResponses.set(requestid, res)
	} else {
		res.send(getter)
	}
})

httpServer.listen(PORT)
