const express = require("express")

const app = express()

const http = require("http")

const WebSocketServer = require("ws").Server

const httpserver = http.createServer(app)


const wss = new WebSocketServer({
	server:httpserver
})


module.exports = {
	httpserver, 
	wss, 
	app
}
