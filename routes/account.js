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




router.get("/dashboard", async (req, res) => {


	let cookies = req.cookies; 


	let user = await getDB().collection("users").findOne({
		session:cookies.session
	}, {
		projection:{
			email:1, 
			name:1,
			projects:1,

		}
	})

	if(!user){

		res.send("error no such user")

	}


	console.log(user)

	res.send(`

		<div class="flex flex-col items-center">

			<div>${user.name}</div>
			<div>${user.email}</div>
	
			<div>
				
				${user.projects.map(project => `
					
					<div>${project}</div>
				`)}

			</div>
			
			<a href="/account/logout" class="text-white text-xl fond-bold p-4 bg-red-500">logout</a>

		</div>
		`)
})

router.get("/", (req, res) => {
	
	let cookies = req.cookies;


	
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


router.get("/logout", async (req, res) => {

	res.clearCookie("session")

	res.redirect("/account/login.html")	

})

module.exports = router
