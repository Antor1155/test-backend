const { updateRedis, getRedis, deleteRedis } = require("../../helpers/redis");

module.exports = {
	setToRedis: async (key, value, timeInSeconds) => {
		await updateRedis(
			{ key },
			{
				value,
				expireAt: new Date(Date.parse(new Date()) + timeInSeconds * 1000),
			}
		);
	},
	getFromRedis: async (key) => {
		try {
			let doc = await getRedis({ key });
			if (!doc) throw `Redis item not found: ${key}`;
			const isExpired = Date.parse(doc.expireAt) < Date.now();
			if (isExpired) deleteRedis({ key });
			return { found: !isExpired, value: doc.value };
		} catch (err) {
			console.log("ERROR getFromRedis", err);
			return { found: false, value: null };
		}
	},
	removeFromRedis: async (key) => {
		return deleteRedis({ key });
	},
};
