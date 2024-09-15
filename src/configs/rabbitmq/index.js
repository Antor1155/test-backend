const amqplib = require("amqplib")

const connect = async () => {
	let channel = null
	try {
		if (process.env.RABBIT_HOST) {
			const amqpServer = process.env.RABBIT_HOST
			const username = process.env.RABBIT_USERNAME
			const password = process.env.RABBIT_PASSWORD
			const opt =
				username && password
					? { credentials: amqplib.credentials.plain("user", "password") }
					: {}
			const connection = await amqplib.connect(amqpServer, opt)
			channel = await connection.createChannel()
			console.log(`RabbitMQ connected to ${amqpServer}`)
		}
		return channel
	} catch (error) {
		console.log(error)
	}
}

module.exports = connect
