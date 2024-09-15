const connect = require("./configs/rabbitmq")

let ch
connect().then((channel) => {
	ch = channel
	ch.assertQueue(`master_crm_${process.env.NODE_ENV}`)
})

module.exports = {}
