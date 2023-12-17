
const express = require("express");

const router = express.Router()

const crypto = require("crypto-js")


const {client} = require("../db/client")


router.use(express.json())

router.post("/login", async (req, res) => {


	if(!req.body.email || !req.body.password) {
		res.send({error:"email or password incorrect"})
		return	
	}


	const {email, password} = req.body; 


	let hashedPass = crypto.SHA256(password).toString()

	let db = client.db("localhost")
	let col = db.collection("users")

	let user = await col.findOne({
		email
	})
	console.log(user, hashedPass)	
	
	res.send({
		success:"hello"
	})
})

router.post("/signup", (req, res) => {


})


module.exports = router
