function $set(key, object){
	localStorage.setItem(key, JSON.stringify(object))
}

function $get(key){
	return JSON.parse(localStorage.getItem(key))
}
function $delete(key){
	localStorage.removeItem(key)
}



function signify(message){
	alert(message)
}
