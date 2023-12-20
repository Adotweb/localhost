function $store(key, object){
		
	localStorage.setItem(key, JSON.stringify(object))
}


function $get(key){
	return JSON.parse(localStorage.getItem(key))
}


function $deleteKey(key){
	localStorage.removeItem(key)
}



async function redirectToProduct(product){

	let session = $get("user-session");

	fetch("/account/verify-session", {
		method:"POST",
		headers:{
			"Content-Type":"application/json",
		},
		body:JSON.stringify({session})
	}).then(res => res.json())
	
		.then(res => {


			if(res.success){

				$store("user", res.user)


				if(product === "lan"){
					window.location.href = "/account"; 

				}if(product === "server"){
					window.location.href = "/checkout";
				}if(product === "aws"){
					window.location.href = "/contact"
				}

			} else{
				window.location.href = "/account"	
			}
		})


}

function navbarAccount(){
	
	document.addEventListener("DOMContentLoaded", () => {
		let accountLink = document.getElementById("account") 


		accountLink.innerHTML = $get("user-session") ? "Account" : "Sign up"

	
	}) 

}
