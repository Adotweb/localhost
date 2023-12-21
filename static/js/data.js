function $set(key, object){
	localStorage.setItem(key, JSON.stringify(key))
}

function $get(key){
	return JSON.parse(localStorage.getItem(key))
}


