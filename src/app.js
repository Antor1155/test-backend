if (process.env.DB_TLS == "true") {
	require("./configs/db/withTLS")
} else {
	require("./configs/db/withoutTLS")
}

require("./consumer")

const express = require("express")
const app = express()
const path = require("path")
const cors = require("cors")
const morgan = require("morgan")
const apiV1 = require("./api-v1")
const EventEmitter = require("node:events")
const { errorHandler } = require("./helpers/utils")

global.ee = new EventEmitter()
require("./events")

global.rootDir = path.resolve(__dirname, "..")
global.isWin = process.platform == "win32"
global.logger = require("./configs/log4js")

process.on("uncaughtException", (error) => {
	error.message = "Uncaught-Error-Exception: " + error.message
	logger.error(error)
	process.exit(0)
})

app.use(morgan("dev"))
app.use(cors())
app.use(express.json(), (err, req, res, next) => {
	if (err) {
		res.status(400).json({
			code: 400,
			status: "failed",
			msg: "Invalid JSON body",
		})
	} else {
		next()
	}
})
app.use(express.urlencoded({ extended: false }))

if (process.env.NODE_ENV == "local") {
	app.use("/api/", apiV1)
} else {
	app.use(apiV1)
}

app.use("/", (req, res) =>
	res.status(200).json({ msg: "Server is up and running" }),
)

app.use(errorHandler)

module.exports = {
	app,
}
