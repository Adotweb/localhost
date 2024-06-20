const DBUserTemplate = {
	userName:"string",
	userId:"string",
	projects: ["string"],
	passwordHash: "string",
	email: "string"
}

const DBProjectTemplate = {
	projectName: "string", 
	projectId : "string",
	projectSecret : "string",
	projectPremium : "boolean", 
	owner: "string" //userid
}

const WSRelayMessage = {
	method:"string",
	sender:"string",
	data:{

	}
	
}

module.exports = {
	DBUserTemplate, 
	DBProjectTemplate,
	checkTemplate
}
