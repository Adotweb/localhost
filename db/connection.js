const {MongoClient} = require("mongodb")
require("dotenv").config()

const MURI = process.env.MURI


const client = new MongoClient(MURI)

const localhostdb = client.db("localhost")

async function runwithDB(func){

	
	try{

		func()

	}catch(e){
		
		console.log("hello")
		await client.close()
	}

}


module.exports = {
	runwithDB,
	localhostdb
}
