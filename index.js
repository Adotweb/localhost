const {createServer} = require("http");
const express = require("express");
const app = express();

const {WebSocketServer} = require("ws");
const path = require("path");


const {mongoConnect, getDB} = require("./db/client")

const {decycle} = require("./utils")

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

				socket.host = data.currentHost





				if(servers.has(socket.host)){
					servers.get(socket.host).send(JSON.stringify({
						method:"connect-client",
						data:{
							clientid:data.id
						}
					}))
				}

				break; 

			case "server-log":


				if(!data.hasOwnProperty("id") || !data.hasOwnProperty("secret")) break;

			
				let db = getDB();
				let collection = db.collection("app_ids"); 


				

				let results = await collection.findOne({
					server_id:data.id
				})



				if(!results) break;
				

				if(data.secret !== results.secret) break;



				servers.set(data.id, socket);
				socket.id = data.id	


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
					


				break;
			

			case "server-ws":
				

				if(data.addressList){
					let ad = data.addressList; 


					

					ad.forEach(address => {
						clients.get(address).send(JSON.stringify({
							method:"ws",
							data
						}))
					})
				}

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


			let host = socket.host; 

			servers.get(host).send(JSON.stringify({
				method:"disconnect-client",
				data:{
					clientid:socket.id
				}
			}))
			

		}
		if(servers.has(id)){
			servers.delete(id)
		}
		


	})
})

const stripe_api = require("./routes/stripe_api")
const account = require("./routes/account")

app.use("/stripe_api", stripe_api)
app.use("/account", account)

app.use(express.static(path.join(__dirname, "/static")))
app.use(express.json())



let stalledResponses = new Map()

app.get("/:serverid/*", (req, res) => {
	let {serverid} = req.params;


	if(servers.has(serverid)){
		let requestid = v4();

		let serving = servers.get(serverid);



		

		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"get",
				route:req.originalUrl.split(serverid)[1], 
				requestid,
				request:decycle(req)
									
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}
})

app.post("/:serverid/*", (req, res) => {
	let {serverid} = req.params;



	if(servers.has(serverid)){
		let requestid = v4();

		let serving = servers.get(serverid); 




		serving.send(JSON.stringify({
			method:"client-req",
			data:{
				method:"post",
				route:req.originalUrl.split(serverid)[1], 
				requestid,
				request:decycle(req)
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}
})



app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "static", "notFound.html"))
})


mongoConnect(() => {
	httpServer.listen(PORT || 5000)
})
