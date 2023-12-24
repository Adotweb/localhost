const express = require("express");
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)

const router = express.Router() 



const {getDB, ObjectId} = require("../db/client")

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

	const {customerId, priceId, userId} = req.body;

	

	let user = await getDB().collection("users").findOne({
		_id:new ObjectId(userId)
	})

	
	let subscriptions = await stripe.subscriptions.list({
		customer:customerId,
		status:"active"
	})

	

	if(user.subscriptionStatus == "free"){

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

			return

	} catch(e) {
		res.send({error:e})

		return
	}

		
	}
	
	if(subscriptions.data[0].cancel_at_period_end){
			res.send({
					redirect:"/products/checkout?reactivate=" + subscriptions.data[0].id
			})

			return

		}	


		res.send({error:"user is already subscribed!"})

		return

})

router.post("/reactivate", async (req, res) => {
	const {customerId, subscriptionId} = req.body;

	let subscriptions = await stripe.subscriptions.list({
		customer:customerId,
		status:"active"
	})



	let serversub = await stripe.subscriptions.update( subscriptionId, {
		cancel_at_period_end:false,
		
	})

	await getDB().collection("users").updateOne({customerId}, {
		$set:{
			subscriptionStatus:"paid-1"
		}
	}, {
		$upsert:true
	})
	

			


	res.send({
		body:"reactivated"
	})

})

router.post("/cancel-subscription", async (req, res) => {

	const {customerId} = req.body;

	let subscriptions = await stripe.subscriptions.list({
		customer:customerId,
		status:"active"
	})

	let serversub = await stripe.subscriptions.update(subscriptions.data[0].id, {
		cancel_at_period_end:true,
		
	})
	
	await getDB().collection("users").updateOne({customerId}, {
		$set:{
			subscriptionStatus:"cancelling"
		}
	}, {
		$upsert:true
	})
			

	res.send({
		body:"canceled"
	})
})



const endpointSecret = process.env.STRIPE_WEBHOOK



router.post('/webhook', express.json({type: 'application/json'}), async (request, response) => {
  const event = request.body;

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;

		  let customer = paymentIntent.customer;

		  getDB().collection("users").updateOne( {
			customerId:customer	
		  }, {
			  $set:{
				  subscriptionStatus:"free",
			  }
		  },{
			  $upsert:true
		  })


	
	
		  break;


	  case "customer.subscription.updated":
		


		
	

		  break;

	  case "customer.subscription.deleted":

		
		getDB().collection("users").updateOne({
			customerId:customer
		}, {
			$set:{
				subscriptionStatus:"free"
			}
		}, {
			$upsert:true
		})


		  break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachmen of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
		  //
		



    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

module.exports = router
