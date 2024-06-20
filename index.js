const { httpserver, app } = require("./server/server") 
const { runwithDB } = require("./db/connection")


const relayRouter = require("./server/relayRouter")
const indexRouter = require("./server/indexRouter")
const accountRouter = require("./server/accountRouter")

app.use("/", indexRouter)
app.use("/relay", relayRouter)
app.use("/account", accountRouter)


runwithDB(() => {
	httpserver.listen(3000)
})
