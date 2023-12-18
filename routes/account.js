
const express = require("express");

const router = express.Router()

const crypto = require("crypto-js")


const {getDB} = require("../db/client")


router.use(express.json())

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

	
	if(user.password === hashedPass){
		
		user.password = undefined

		res.send({
			success:true,
			data:user
		})

		return
	}else{
		res.send({error:"email or password are wrong"})
	}

})

router.post("/signup", async (req, res) => {
	
	let errors = [];
	let success = false;
	let data = false; 

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
		
	currentUser = {
		email, 
		name, 
		surname, 
		password:crypto.SHA256(password).toString(),
	}
	
	const response = await users.insertOne(currentUser)
	

	currentUser.password = undefined

	res.send({
		success:true,
		data:currentUser
	})
})


module.exports = router
