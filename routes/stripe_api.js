const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 



const {getDB} = require("../db/client")

router.use(express.json())

router.get("/", (req, res) => {
	
	
	res.send("Hello there")
})



router.post("/charge", async (req, res) => {
	

	const {email} = req.body
	

	let users = getDB().collection("users")

	let user = await users.findOne({email})

	console.log(user)

	if(user){
		res.send({success:"user exists"})
	} else {
		res.send({error:"user does no exist"})
	}
})

router.get("/checkout", async (req, res) => {


	console.log(req.originalUrl, req.path)	

	const session = await stripe.checkout.sessions.create({
		mode:"subscription",
		payment_method_types:["card"],
		line_items:[
			{
				price:"price_1OOE3gK9X9Bv58NryL2YiVLW",
				quantity:"1"
			}
		],
		success_url:"http://localhost:5000",
		cancel_url:"http://localhost:5000"
	})


	res.redirect(session.url)
})


const endpointSecret = process.env.STRIPE_WEBHOOK


router.post("/dostuff", )


router.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);

  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

	
	let email = false;

	switch(event.type){
		case "checkout.session.completed": 
		
			
			const sessionid = event.data.object.id; 

			const session = await stripe.checkout.sessions.retrieve(sessionid)

			
			let customer = session.customer_details 


			email = customer.email

		break;
	}


	let users = getDB().collection("users") 

	const apps = getDB().collection("apps")


	if(email){

		let customer = await users.findOne({email})
		
		console.log(customer)
	}




  response.send();
});

module.exports = router
