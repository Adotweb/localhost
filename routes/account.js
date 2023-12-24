const stripe = require("stripe")(process.env.STRIPE_KEY)
const express = require("express");

const router = express.Router()

const crypto = require("crypto-js")
const cr = require("crypto")

const {v4} = require("uuid")

const {getDB, ObjectId} = require("../db/client")


router.use(express.json())


router.post("/verify-session", async (req, res) => {

	const {session} = req.body



	let user = await getDB().collection("users").findOne({session}, {
		projection:{
			name:1, 
			email:1,
			surname:1,
			customerId:1,
			projects:1,
			subscriptionStatus:1
		}
	})

	if(user){

		res.send({success:true, user})

		return
	} else {
		res.send({error:"no session?"})
	}

})


router.post("/login", async (req, res) => {


	if(!req.body.email || !req.body.password) {
		res.send({error:"email or password incorrect"})
		return	
	}


	const {email, password} = req.body; 


	let hashedPass = crypto.SHA256(password).toString()
	

	let db = getDB()
	let col = db.collection("users")

	let user = await col.findOne({
		email
	})


	if(!user){
		res.send({error:"no such user"})
		return
	}
	
	if(user.password === hashedPass){
		
		user.password = undefined

	
		let session = v4()




		await getDB().collection("users").updateOne({
			email
		}, {
			"$set":{
				session
			}
		}, {
			upsert:true
		})


		res.send({
			success:true,
			session,
		})

		return
	}else{
		res.send({error:"email or password are wrong"})
	}

})

router.post("/signup", async (req, res) => {
	

	let currentUser = {}


	const users = getDB().collection("users")

	if(!req.body.email){
		res.send({error:"no email provided"})

		return
	} 
	
	let possibleuser = await users.findOne({email:req.body.email})

	if(possibleuser){
		res.send({error:"email already exists"})
		return
	}

	if(!req.body.name){
		res.send({error:"no name provided"})
		return
	}
	if(!req.body.surname){
		res.send({error:"no surname provided"})
		return
	}
	if(!req.body.password){
		res.send({error:"no password provided"})
	}

	const {email, name, surname, password} = req.body; 

	
	
	const customer = await stripe.customers.create({
		email,
		name, 
	})

	let customerId = customer.id


	const session = v4()


	currentUser = {
		email, 
		name, 
		surname, 
		password:crypto.SHA256(password).toString(),
		customerId,
		session,
		projects:[],
		subscriptionStatus:"free"
	}

	
	const response = await users.insertOne(currentUser)




	res.send({
		success:true,
		session	
	})
})


router.post("/createproject", async (req, res) => {
	

	const {projectName, owner} = req.body;

	

	let app_id = v4();
	let api_key = v4();

	let user = await getDB().collection("users").findOne({
		_id:new ObjectId(owner)		
	})


	if(user.projects.length >= 1){
		res.send({error:"only one project per user"})

		return
	}

	let tier = user.subscriptionStatus


	await getDB().collection("projects").insertOne({
		app_id, 
		api_key,
		projectName,
		owner,
		tier
	})

	await getDB().collection("users").updateOne({_id:new ObjectId(owner)},{
		$push:{
			projects:app_id
		}
	})
		

	res.send({success:"project created!"})
})


router.post("/getprojects", async (req, res) => {

	let {_id} = req.body;



	let p = await getDB().collection("projects").find({
		owner: _id
	}).toArray()


	res.send({success:true, p})

})

module.exports = router
