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

	if(usersession.error){
		signify(usersession.error)
		return
	}

	let session = usersession.session	
	$set("user-session", session)	

	window.location.href = "/account/"
}


async function logout() {
	$delete("user")
	$delete("user-session")
	window.location.reload()
}

async function signup(){

	let password = document.getElementById("password").value; 
	let email = document.getElementById("email").value
	let name = document.getElementById("name").value
	let surname = document.getElementById("surname").value

	let res = await fetch("/account/signup", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			password, email, name, surname
		})
	})

	let usersession = await res.json()


	if(usersession.error){
		signify(usersession.error)
		return
	}

	usersession = usersession.session


	$set("user-session", usersession)
	
	window.location.href = "/account/"	
}

async function getProjects(){

	let {projects, _id} = $get("user")		
	
	let response = await fetch("/getProjects", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({
			projects, 
			_id
		})
	})


	if(response.error){
		return
	}
	
	
	let {fetchedProjects} = response

}

function openProjectCreator(){
	let modal = document.getElementById("projectCreator");
	modal.style.display = "flex"


	document.getElementById("closer").addEventListener("click", () => {
		modal.style.display = "none"
	})
}

async function createProject(){

	let owner = $get("user")._id;

	let projectName = document.getElementById("projectName").value;


	let res = await fetch("/account/createproject", {
		method:"POST",
		headers:{
			"Content-Type":"application/json",
		},
		body:JSON.stringify({
			owner, 
			projectName
		})
	})


}

async function getProjects(){
	let {_id} = $get("user")

	
	let res = await fetch("/account/getprojects", {
		method:"POST",
		headers:{
			"Content-Type":"application/json",
		},
		body:JSON.stringify({
			_id	
		})
	})


	return await res.json()
}

async function cancelSub() {
	
	let response = await fetch("/stripe_api/cancel-subscription", {
		method:"POST",
		headers:{
			"Content-Type":"application/json"
		},
		body:JSON.stringify({

			customerId:$get("user").customerId
		})
	})

	response = await response.json()

	if(response.redirect){
		window.location.href = response.redirect
	}
		
}
