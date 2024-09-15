require("dotenv").config()
const fs = require("fs")
const path = require("path")
const EventEmitter = require("events")
const chalk = require("chalk")

if (process.env.DB_TLS == "true") {
	console.log(chalk.red(`SERVER IS CONNECTING TO PRODUCTION DATABASE`))
} else {
	console.log(chalk.blue(`SERVER IS CONNECTING TO TEST DATABASE`))
}

global.rootDir = path.resolve(__dirname, "..", "..")
global.isWin = process.platform == "win32"
global.logger = require("../configs/log4js")
// to initialize agenda for sending job, remove after complete migration
global.createHistory = async ({
	kind,
	item,
	user,
	operation,
	snapshot,
	comment,
}) => {
	try {
		const data = await new History({
			kind,
			item,
			user,
			operation,
			snapshot,
			comment,
		}).save()
		return data
	} catch (error) {
		logger.error(error)
		return null
	}
}

const eventEmitter = new EventEmitter()
eventEmitter.on("event", () => {
	logger.info("an event occurred!")
})
global.ee = eventEmitter
require("../events")

if (process.env.DB_TLS == "true") {
	require("../configs/db/withTLS")
} else {
	require("../configs/db/withoutTLS")
}

setTimeout(async () => {
	// call scripts here
	// if run clear-everything, then disable on server run script
	//
	// require("../helpers/BotForKam")()
	// require("./cleanPipelineLead")()
}, 2000)
