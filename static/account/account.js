async function login(){
	let password = document.getElementById("password").value; 

	let email = document.getElementById("email").value

	
	let res = await fetch("/account/login", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			password, email
		})
	}) 
	
	let usersession = await res.json()
	

	let session = usersession.session	
	$set("user-session", session)	

	window.location.href = "/account/"
}

async function signup(){

	let password = document.getElementById("password").value; 
	let email = document.getElementById("email").value
	let name = document.getElementById("name").value
	let surname = document.getElementById("surname").value

	let res = await fetch("/account/login", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			password, email, name, surname
		})
	})

	let usersession = await res.json()
	
	if(!usersession.success)
	$set("user-session", usersession)
	
	window.location.href = "/account/"	
}


