const stripe = require("stripe")(process.env.STRIPE_KEY)
const express = require("express");
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const path = require("path")
const router = express.Router()

const crypto = require("crypto-js")
const cr = require("crypto")

const {v4} = require("uuid")

const {getDB, ObjectId} = require("../db/client")


router.use(express.json())
router.use(bodyParser())
router.use(cookieParser())




router.get("/", (req, res) => {
	
	let cookies = req.cookies;

	console.log(cookies)

	
	if(!cookies.session){
		
			
		res.redirect("/account/login.html")
		return
	}
	
	
	res.sendFile(path.join(__dirname, "..", "static", "account", "index.html"))

})

router.post("/login", async (req, res) => {


	if(req.cookies.session){
		
		res.redirect("/account/")
		return
	}

	let {email, password} = req.body;	

	let users = getDB().collection("users")



	password = crypto.SHA256(password).toString()

	let user = await users.findOne({email, password})


	console.log(user)

	if(!user){
		
		res.send("email not found or password incorrect")
		return
	}

	let session = v4();

	await users.updateOne({
		email, password
	}, {
		$set:{
			session
		}
	}, {
		$upsert:"true"
	})	


	res.cookie("session", session)
	res.redirect("/account/")
})

router.post("/signup", async (req, res) => {

	let users = getDB().collection("users")
	
	let {name, surname, email, password} = req.body;
	
	let emailexists = await users.findOne({email})


	if(emailexists){
		
		res.send("this email is already in use")
		return
	}

	password = crypto.SHA256(password).toString()


	let session = v4();

	let newuser = {
		name, 
		password,
		email,
		surname,
		tier:"free",
		session,
		projects:[]
	}	

	await users.insertOne(newuser)	


	res.cookie("session", session)
	res.redirect("/account/")
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
