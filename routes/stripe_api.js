const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 


require("../db/client")

router.get("/", (req, res) => {
	
	
	res.send("Hello there")
})


router.get("/checkout", async (req, res) => {


	

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

	console.log(session)

	res.redirect(session.url)
})


const endpointSecret = "whsec_ffb03ea580ee5b81b26263b432d8aaabb2c3116a73cfa81c2f564fcb9b5d32ff"

router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

module.exports = router
