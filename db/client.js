const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb")
require("dotenv").config()

const client = new MongoClient(process.env.MURI, {

	serverApi:ServerApiVersion.v1
})

let _db;

const mongoConnect = callback => {
	client.connect(process.env.MURI, {
		serverApi:ServerApiVersion.v1
	}).then(client => {

		if(process.env.ENV==="dev"){_db = client.db("localhost")}
		else _db = client.db("localhost-prod")
			

		callback();
	}).catch(e => {
		console.log(e) 
		throw new Error("DB connection failed")
	})
}

const getDB = () => {
	if(_db){
		return _db;
	} else {
		throw new Error("DB connect failed")
	}

}


module.exports = {
	mongoConnect,
	getDB, 
	ObjectId
}
