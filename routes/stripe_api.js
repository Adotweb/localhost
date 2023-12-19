const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 



const {getDB} = require("../db/client")

router.use(express.json())

router.get("/", (req, res) => {
	
	
	res.send("Hello there")
})



const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "chf",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

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
