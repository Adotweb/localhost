const {createServer} = require("http");
const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

const app = express();

const {BSON} = require("bson")


const {WebSocketServer} = require("ws");
const path = require("path");


const {mongoConnect, getDB} = require("./db/client")

const {decycle} = require("./utils")

const httpServer = createServer(app)

const wss = new WebSocketServer({server:httpServer})


const {v4} = require("uuid")


require("dotenv").config()

const PORT = process.env.PORT || 5000


let hosts = new Map();
let clients = new Map();


wss.on("connection", socket => {

	socket.on("message", async msg => {
	

		const Send = (m) =>  socket.send(JSON.stringify(m))


		socket.Send = Send

		
		let data, event; 


		try{
			data = JSON.parse(msg).data;
			event = JSON.parse(msg).event
		}catch(e){
			socket.Send(e)

			return
		}




		switch(event){
			
			case "host.login":

				id = data.id;
				secret = data.secret;





				if(!id || !secret) {
					socket.Send({
						event:"server.login.failed",
						data:{}
					})	

					break
				}

				
				let user = await getDB().collection("projects").findOne({
					id, 
					secret
				})



				if(!user){
					socket.Send({
						event:"server.login.unauthorized",
						data:{}
					})

					break
				}

				hosts.set(id, socket)

				socket.hostId = id;



				break;

		


			case "host.rest.response":
				

				requestid = data.requestid

				response = data.response
				
				let r = stalledResponses.get(requestid)


				

				try{


					Object.keys(response.headers).forEach(header => {
					
						r.set(header, response.headers[header])

					})	
						
					if(response.redirected){


						let redirectUrl = (response.headers["location"].split("/").filter(s => s !== "")[0] == "id") ? response.headers["location"] : "/id" + response.headers["location"]
						r.redirect(redirectUrl)

					}

					if(response.isBuf){

						res = (Buffer.from(new Uint8Array(response.body)))
					}
					else{
						res = response.body
					}

				}catch{

					r.status(404).send()
					break;
				}
				

				
				r.send(res)

				break;

			case "client.login":
				
				id = data.id;
			



				if(!id){
					socket.Send({event:"client.login.failed", data:{}})
					break;	
				}
				


				clients.set(id, socket)

				socket.clientId = id
				break;


			case "ws.message.toclient":
			

				let clientList = data.clientList; 

				if(!(clientList instanceof Array)){
					socket.Send({
						event:"your clientlist has to be of type Array"
					})	

					break;
				}
				
				clientList.forEach(clientid => {
					


					if(!clients.get(clientid)) return

					clients.get(clientid).Send(data)	

				})				

				break;


			case "ws.message.tohost":


				let host = data.host;

				data.host = undefined;

				message = data; 

				if(!host || !message || !hosts.get(host)){
					socket.Send({
						event:"tohost.failed"
					})
					break;
				}
				

				hosts.get(host).Send({
					event:"ws.message.tohost",
					data:message	
				})
			

				break;
		}

		

	})


	socket.on("close", () => {
		

		
		if(socket.hostId){
			hosts.delete(socket.hostId)
		}if(socket.clientId){
			clients.delete(socket.clientId)
		}


	})
})

const stripe_api = require("./routes/stripe_api")
const account = require("./routes/account")



app.use("/stripe_api", stripe_api)
app.use("/account", account)

app.use(express.static(path.join(__dirname, "/static")))
app.use(bodyParser())
app.use(cookieParser())


let stalledResponses = new Map()


app.get("/id/*", (req, res) => {

	let serverid = req.cookies.currenthost;		


	if(hosts.has(serverid)){
		let requestid = v4();

	res.cookie("currenthost", serverid)
		let serving = hosts.get(serverid);



		route=req.originalUrl.split("id")[1], 



		serving.send(JSON.stringify({
			event:"client.rest.request",
			data:{
				method:"GET",
				requestid,
				request:decycle(req),
				route							
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}


})

app.post("/id/*", (req, res) => {

	let serverid = req.cookies.currenthost; 


	if(hosts.has(serverid)){
		let requestid = v4();

		let serving = hosts.get(serverid); 


		

		let request = decycle(req)

		serving.send(JSON.stringify({
			event:"client.rest.request",
			data:{
				method:"POST",
				route:req.originalUrl.split("id")[1], 
				requestid,
				request	
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}


})

app.get("/apps", (req, res) => {

	let apps = [...hosts.keys()]


	res.send(`

			
		<div class="flex flex-col">

			${apps.map(app => `<a href="/${app}/">${app}</a>`)}

		</div>	

		`)
	
})

app.get("/:serverid/*", (req, res) => {
	let {serverid} = req.params;
	

	if(hosts.has(serverid)){
		let requestid = v4();

	res.cookie("currenthost", serverid)
		let serving = hosts.get(serverid);



		route=req.originalUrl.split(serverid)[1], 



		serving.send(JSON.stringify({
			event:"client.rest.request",
			data:{
				method:"GET",
				requestid,
				request:decycle(req),
				route							
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}
})

app.post("/:serverid/*", (req, res) => {
	let {serverid} = req.params;



	if(hosts.has(serverid)){
		let requestid = v4();

		let serving = hosts.get(serverid); 


		

		let request = decycle(req)

		serving.send(JSON.stringify({
			event:"client.rest.request",
			data:{
				method:"POST",
				route:req.originalUrl.split(serverid)[1], 
				requestid,
				request	
			}
		}))
		

		stalledResponses.set(requestid, res)
	} else {
		res.sendFile(path.join(__dirname, "static", "notFound.html"))
	}
})

app.get("/navbar", async (req, res) => {

	let {session} = req.cookies

	let user = {};

	if(session){

		user = await getDB().collection("users").findOne({session})

		
		
	}


	res.send(`	<div class="sticky bg-white top-0 left-0 z-10 flex justify-between p-4 text-xl backdrop-blur-md font-bold">
		<div class="right flex justify-space gap-4">
			<a href="./server">Server</a>
			<a href="./client">Client</a>
			<a href="./documentation">Docs</a>
		</div>


		<div class="right flex justify-space gap-4">
			<a href="/">Home</a>
			<a id="accountref" href="/account">${user.name || "Login"}</a>
		</div>
	</div>

`)	

})






app.get("*", (req, res) => {



	


	res.sendFile(path.join(__dirname, "static", "notFound.html"))
})




mongoConnect(() => {
	httpServer.listen(PORT || 5000)
})
