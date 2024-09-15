const { setToRedis, getFromRedis, removeFromRedis } = require("./redisActual");
const redisMongo = require("./redisMongo");

module.exports = {
	setToRedis: async (key, value, time) =>
		process.env.REDIS_HOST
			? setToRedis(key, value, time)
			: redisMongo.setToRedis(key, value, time),

	getFromRedis: async (key) =>
		process.env.REDIS_HOST ? getFromRedis(key) : redisMongo.getFromRedis(key),

	removeFromRedis: async (key) =>
		process.env.REDIS_HOST
			? removeFromRedis(key)
			: redisMongo.removeFromRedis(key),
};
