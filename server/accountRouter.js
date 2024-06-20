const { z } = require("zod")

const { Router, json } = require("express")
const {urlencoded} = require("body-parser")
const accountRouter = Router()

accountRouter.use(json())
accountRouter.use(urlencoded({extended:true}))

const { localhostdb } = require("../db/connection")

const LoginSchema = z.object({
	username:z.string(),
	password:z.string()
})

const SignupSchema = z.object({
	username:z.string(),
	password:z.string(),
	email:z.string(),
})


accountRouter.get("/projects", (req, res) => {


})


accountRouter.post("/login", async (req, res) => {

	console.log(req.body)

	try{
		
		const {username, password} = LoginSchema.parse(req.body)

		console.log(username, password)

		res.send(username + " " + password)

	}catch(e){
		res.status(400).send({
			errors:e.issues.map(s => ({message:s.message, field:s.path.join(">")}))
		})
	}

})


module.exports = accountRouter
