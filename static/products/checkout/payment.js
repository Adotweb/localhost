const stripe = Stripe("pk_test_51KO6DEK9X9Bv58Nrz8Oo9YENoMmEqCIUNpJ8zTxubQwlrZf6CB3bg37xNngHhtGWatC2GYXmLDIj59cJorcYztK000CJMqqZ1C");


const params = new URLSearchParams(window.location.search);

const products = {
	"server-builder":"price_1OOE3gK9X9Bv58NryL2YiVLW"
}

if(params.get("reactivate")){
	
	document.getElementById("desc").style.display ="none";
	document.getElementById("reactivate").style.display = "flex"

} else {


	switch(params.get("product")){
	
	case "lan-partier":
		window.location.href = "/account/"

		break;
	

	case "aws-contender":
		window.location.href = "/contact"

		break; 

	

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
		customerId:$get("user").customerId,
		userId:$get("user")["_id"]
	})
}).then(res => res.json())
	.then(res => {

		if(res.error){
				
				const messageContainer = document.querySelector('#error-message');
				messageContainer.textContent = res.error;
		}
		if(res.redirect){
			window.location.href = res.redirect
		}

		const {clientSecret} = res



		const options = {
  			clientSecret,
		};

		const elements = stripe.elements(options);

		const paymentElement = elements.create('payment');
		paymentElement.mount('#payment-element');
		let subscribeButton = document.getElementById("submit")



		paymentElement.on("ready", () => {

			subscribeButton.style.display = "flex"
		})

		const form = document.getElementById('payment-form');

		form.addEventListener('submit', async (event) => {
 			event.preventDefault();

  			const {error} = await stripe.confirmPayment({
    				elements,
    				confirmParams: {
      					return_url: window.location.origin,
				}
			});

  			if (error) {
    			
				const messageContainer = document.querySelector('#error-message');
				messageContainer.textContent = error.message;
  			
			} else {
  			
			}
		});

	

	})





}

async function confirmReactivation(){

	await fetch("/stripe_api/reactivate", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			subscriptionId : params.get("reactivate"),
			customerId : $get("user").customerId
		})
	}).then(res => {
		if(res.error){
			return
		}

		window.location.href = "/account/"
	})

}


