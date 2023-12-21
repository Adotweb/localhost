async function login(){
	let password = document.getElementById("password").value; 

	let email = document.getElementById("email").value

	console.log(password, email)
	
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
	

	$set("user-session", usersession)

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

	$set("user-session", usersession)



}


