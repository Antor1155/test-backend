require("dotenv").config()
let jwt = require("jsonwebtoken")
const { Roles } = require("../helpers/enums")
const getGuestId = (req) => {
	let guest_id = null
	if (
		typeof req.headers.guestid == "string" &&
		req.headers.guestid !== "null"
	) {
		guest_id = req.headers.guestid
	}
	return guest_id
}
const verifyAndLet = (req, next, jwtSecret) => {
	try {
		let decoded = jwt.verify(req.headers.accesstoken, jwtSecret)
		req.user = { ...decoded }
		next()
		return null
	} catch (error) {
		return { error }
	}
}

module.exports = {
	verifyAndLet,
	getGuestId,
	authenticatedRequest: {
		must: (req, res, next) => {
			try {
				const payload = req.headers.accesstoken?.split(".")[1]
				if (!payload) throw "Payload is null"
				const decoded = JSON.parse(Buffer.from(payload, "base64").toString())

				const res = verifyAndLet(req, next, process.env.ACCESS_TOKEN_SECRET)
				if (res) throw res.error
			} catch (error) {
				console.log(error.message)
				return res.status(401).json({
					code: 401,
					status: "Unauthorized",
					msg: "Unauthorized Request",
				})
			}
		},

		optional: (req, res, next) => {
			try {
				const payload = req.headers.accesstoken.split(".")[1]
				if (!payload) throw "Payload is null"
				const decoded = JSON.parse(Buffer.from(payload, "base64").toString())
				req.user = { ...decoded, guest_id: getGuestId(req) }
				next()
			} catch (error) {
				req.user = { guest_id: getGuestId(req), role: Roles.OPTIONAL }
				next()
			}
		},
	},
}
