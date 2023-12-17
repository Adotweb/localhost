const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 


const {client} = require("../db/client")

router.get("/", (req, res) => {
	
	
	res.send("Hello there")
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


const endpointSecret = "whsec_ffb03ea580ee5b81b26263b432d8aaabb2c3116a73cfa81c2f564fcb9b5d32ff"

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


	let users = client.db("localhost").collection("users") 

	const apps = client.db("localhost").collection("apps")


	if(email){

		let customer = await users.findOne({email})
		
		console.log(customer)		

	}




  response.send();
});

module.exports = router
