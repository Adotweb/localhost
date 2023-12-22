async function checkAccount(){
	let user = $get("user")

		let accountref = document.getElementById("accountref")
	if(user){

		accountref.innerHTML = user.name
	}else {
		
		const usersession = $get("user-session");

		if(!usersession) return

		let res = await fetch("/account/verify-session", {
			method:"POST", 
			headers:{
				"Content-Type":"application/json"
			},
			body:JSON.stringify({
				session:usersession
			})
		})
		

		user = (await res.json()).user;
		$set("user", user)

		accountref.innerHTML = user.name
	}
}



const navBarText = `	<div class="sticky top-0 left-0 z-10 flex justify-between p-4 text-xl backdrop-blur-md font-bold">
		<div class="right flex justify-space gap-4">
			<a href="./server">Server</a>
			<a href="./client">Client</a>
			<a href="./documentation">Docs</a>
		</div>


		<div class="right flex justify-space gap-4">
			<a href="/">Home</a>
			<a id="accountref" href="/account">Sign up</a>
		</div>
	</div>

`


let navBar = document.querySelector(".navBar");

navBar.outerHTML = navBarText


checkAccount()
