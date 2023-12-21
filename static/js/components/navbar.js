function checkAccount(){
	const user = $get("user")

	if(user){
		let accountref = document.getElementById("accountref")

		accountref.innerHTML = user.name
	}else {

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
			<a id="accountref" href="./account">Sign up</a>
		</div>
	</div>

`


let navBar = document.querySelector(".navBar");

navBar.outerHTML = navBarText


checkAccount()
