const {MongoClient, ServerApiVersion} = require("mongodb")
require("dotenv").config()

const client = new MongoClient(process.env.MURI, {

	serverApi:ServerApiVersion.v1
})



module.exports = {
	client
}
