function $store(key, object){
		
	localStorage.setItem(key, JSON.stringify(object))
}


function $get(key){
	return JSON.parse(localStorage.getItem(key))
}


function $deleteKey(key){
	localStorage.removeItem(key)
}
