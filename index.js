const {createServer} = require("http");
const express = require("express");
const app = express();

const {WebSocketServer} = require("ws");
const path = require("path");

const httpServer = createServer(app)

const wss = new WebSocketServer({server:httpServer})

require("dotenv").config()

const PORT = process.env.PORT || 5000


let servers = new Map();
let clients = new Map();


wss.on("connection", socket => {
	console.log("connection")
})



app.use(express.static(path.join(__dirname, "/static")))


httpServer.listen(PORT)
