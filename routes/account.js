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

	let projects;

	if(user.projects.length > 0){

		let owner = user._id.toString();


		projects = await getDB().collection("projects").find({owner}).toArray()

	}

		console.log(projects)
	res.send(`

		<div class="flex flex-col md:flex-row items-center md:items-center p-4 w-full gap-4 md:h-[200px]">

		

			<div class="usercard flex flex-col  p-4 bg-gray-100 rounded-lg drop-shadow-xl">

				<div class="name text-3xl font-bold">${user.name}</div>
				<div class="email text-xl font-bold">${user.email}</div>
				
				<br>
				

				<div class="email text-red-400 text-xl font-bold">Danger Zone</div>

				<button hx-get="/logout" class="p-2 mt-2 w-full rounded-md text-white text-xl font-bold bg-red-400">Logout</button>

			</div>

			<script>
				function copy(id, secret){
					navigator.clipboard.writeText(JSON.stringify({
						id,
						secret		
						
					}))
				}
			</script>
			<div class="projects bg-gray-100 rounded-lg drop-shadow-xl flex flex-col md:grid grid-cols-3 p-4 gap-2 h-full">

				${projects.map(project => `

					<div class="project border-2 rounded-md p-4">
						<div>project id : ${project.id}</div>
						<button onclick="copy('${project.id}', '${project.secret}')">Click to copy configuration</button>	
					</div>
				`)}

	


			</div>			

			

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


	let project = {
		id:v4(),
		secret:v4(),
			
	}

	let newuser = {
		name, 
		password,
		email,
		surname,
		tier:"free",
		session,
		projects:[project.id]
	}	

	let user = await users.insertOne(newuser)	
	
	project.owner = user.insertedId.toString();

	await getDB().collection("projects").insertOne(project)

	res.cookie("session", session)
	res.redirect("/account/")
})


router.get("/logout", async (req, res) => {

	res.clearCookie("session")

	res.redirect("/account/login.html")	

})

module.exports = router
