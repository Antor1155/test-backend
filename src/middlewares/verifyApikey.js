const verifyApikey = (req, res, next) => {
	try {
		const apikey = req.headers["x-api-key"]

		if (apikey === process.env.API_KEY) {
			return next()
		}

		throw new Error("Unauthorized Access")
	} catch (err) {
		return res.status(400).json({
			msg: err.message,
			code: 400,
			status: "failed",
		})
	}
}

module.exports = verifyApikey
