const { localhostdb } = require("../../db/connection")



async function loginHost(projectId, projectSecret){


	if(!projectId || !projectSecret){
		return false
	}

	let project = await localhostdb.collection("projects").findOne({
		projectId,
		projectSecret
	})
	
	console.table({projectId, projectSecret, project})

	if(project){
		return 
	}else{
		throw new Error({
			"error":"HostId or HostSecrect seem to be wrong!"
		})
	}
}


module.exports = {
	loginHost
}
