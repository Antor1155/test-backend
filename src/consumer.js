const connect = require("./configs/rabbitmq")
const { ConsumerTasks } = require("./configs/rabbitmq/constants")

connect().then((channel) => {
	try {
		channel.assertQueue(`crm_publisher_${process.env.NODE_ENV}`)
		channel.consume(`crm_publisher_${process.env.NODE_ENV}`, async (body) => {
			const content = JSON.parse(body.content)
			let { pattern, data } = content

			try {
				switch (pattern) {
					case ConsumerTasks.LEAD_TO_CRM_QUEUE:
						break
					default:
						break
				}
			} catch (error) {
				console.log(error)
				logger.error(error)
			}
			channel.ack(body)
		})
	} catch (error) {
		console.log(error)
	}
})
