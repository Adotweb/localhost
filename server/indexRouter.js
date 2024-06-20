const { Router } = require("express")


const indexRouter = Router()

indexRouter.get("/", (req, res) => {


	res.send("hello")

})


module.exports = indexRouter
