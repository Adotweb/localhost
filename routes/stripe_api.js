const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 



const {getDB} = require("../db/client")

router.use(express.json())



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


router.post("/create-subscription", async (req, res) => {

	const {customerId, priceId} = req.body;


	try{
		const subscription = await stripe.subscriptions.create({
      			customer: customerId,
      			items: [{
        			price: priceId,
      			}],
      			payment_behavior: 'default_incomplete',
     			payment_settings: { save_default_payment_method: 'on_subscription' },
     			expand: ['latest_invoice.payment_intent'],
    		});


		res.send({
			subscriptionId:subscription.id, 
			clientSecret:subscription.latest_invoice.payment_intent.client_secret
		})

	} catch(e) {
		res.send({error:e})
	}

})



const endpointSecret = process.env.STRIPE_WEBHOOK



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
