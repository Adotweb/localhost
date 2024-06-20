const { z, ZodError  } = require("zod")

z.setErrorMap((issue, ctx) => {

	if(issue.code === "invalid_union"){
		let received = issue.unionErrors.map(err => JSON.parse(err)[0].received)[0]
		let allowed = (issue.unionErrors.map(err => JSON.parse(err)[0].expected)).join('|')	

		return {message : `${received} does not match union type ${allowed}`}
	
	}

	if(issue.code === "invalid_type"){
		return {message: `expected ${issue.expected}, received ${issue.received}`}
	}

	return {message:ctx.defaultError}
})

const MessageSchema = z.object({
	sender:z.union([
		z.literal("host"),
		z.literal("client")
	]),
	method:z.union([
		z.literal("login"),
		z.literal("message")
	]),
	data:z.any()
})



const HostLoginSchema = MessageSchema.extend({
	data:z.object({
		hostId:z.string(),
		hostSecret:z.string()
	})
})


const RelayMessageSchema = MessageSchema.extend({
	data:z.object({
		receiverList: z.array(z.string()).nonempty(), 
		data:z.union([z.string(), z.object(), z.number(), z.array()])
	})
})

const RestResponseSchema = MessageSchema.extend({
	requestId: z.string(),
	body: z.union([
		z.string(), //pure text
		z.array(z.number()).nonempty(), //buffers (Uint8Arrays)
	]).optional(),
	redirect:z.string().optional(),
	meta:z.object({
		headers:z.array(z.object({
			headerName : z.string(),
			headerValue : z.string()
		})),
		status:z.number()
	})
}).refine((data) => !!data.body || !!data.redirect, {message:"Either Body or Redirect need to be set!"})




module.exports = {
	RelayMessageSchema, 
	MessageSchema,
	HostLoginSchema,
	RestResponseSchema
}
