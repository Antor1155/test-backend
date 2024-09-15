const redisClient = require("../../configs/redis")

module.exports = {
	setToRedis: async (key, value, time) => {
		try {
			await redisClient.set(key, value)
			await redisClient.expire(key, time)
		} catch (error) {
			logger.error(error)
		}
	},
	getFromRedis: async (key) => {
		try {
			let res = await redisClient.get(key)
			return { found: res ? true : false, value: res }
		} catch (error) {
			logger.error(error)
			return { found: false, value: null }
		}
	},
	removeFromRedis: async (key) => {
		try {
			await redisClient.del(key)
			return true
		} catch (error) {
			logger.error(error)
			return false
		}
	},
}
