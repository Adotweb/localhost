function $store(key, object){
		
	localStorage.setItem(key, JSON.stringify(object))
}


function $get(key){
	return JSON.parse(localStorage.getItem(key))
}


function $deleteKey(key){
	localStorage.removeItem(key)
}



function checkAccount(callback){


	let currentUser = $get("user")

	fetch("/login", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			email:currentUser.email,

		})
	}).then(res => res.json())
		.then(res => {

		})

}
