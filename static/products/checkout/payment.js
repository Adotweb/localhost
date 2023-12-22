const stripe = Stripe("pk_test_51KO6DEK9X9Bv58Nrz8Oo9YENoMmEqCIUNpJ8zTxubQwlrZf6CB3bg37xNngHhtGWatC2GYXmLDIj59cJorcYztK000CJMqqZ1C");


const params = new URLSearchParams(window.location.search);

const products = {
	"lan-partier":"price_1OOE3gK9X9Bv58NryL2YiVLW"
}

if(!($get("user"))){
	
	window.location.href = "/account"

}

fetch("/stripe_api/create-subscription", {
	method:"POST",
	headers:{
		"Content-Type":"application/json"
	},
	body:JSON.stringify({
		priceId:products[params.get("product")],
		customerId:$get("user").customerId
	})
}).then(res => res.json())
	.then(res => {


		const {subscriptonId, clientSecret} = res


		console.log(res)

		const options = {
  			clientSecret,
		};

		const elements = stripe.elements(options);

		const paymentElement = elements.create('payment');
		paymentElement.mount('#payment-element');



		const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: window.location.origin,
    }
  });

  if (error) {
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Show error to your customer (for example, payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});

	})




