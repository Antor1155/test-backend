let redis = require("async-redis")

let options = {
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
}

// check if redis is password protected
if (process.env.REDIS_PASSWORD) {
	options["password"] = process.env.REDIS_PASSWORD
}

if (process.env.REDIS_USERNAME) {
	options["username"] = process.env.REDIS_USERNAME
}

if (process.env.REDIS_TLS == "true") {
	options["tls"] = {}
}

let client = null

if (process.env.REDIS_HOST) {
	client = redis.createClient(options)

	client.on("connect", () => {
		logger.trace("Redis is connected")
	})

	client.on("error", (error) => {
		error.message = "Redis connection fail: " + error.message
		logger.error(error)
	})
}

module.exports = client
