const { Roles, RolesIntegerMap } = require("../helpers/enums")

const roleHandler = {
	multiple: (arr) => {
		return (req, res, next) => {
			try {
				let role = req.user.role ? req.user.role : 0

				if (role === Roles.OPTIONAL) return next()

				if (!arr.includes(RolesIntegerMap[role])) {
					return res.status(403).json({
						code: 403,
						status: "forbidden",
						msg: "Access denied",
					})
				}

				next()
			} catch (error) {
				logger.error(error, req)
				return res.status(500).json({
					code: 500,
					status: "error",
					msg: "Internal server error",
				})
			}
		}
	},
	except: (arr) => {
		return (req, res, next) => {
			try {
				let role = req.user.role ? req.user.role : 0
				if (role === Roles.OPTIONAL) return next()
				if (!arr.length) return next()
				if (arr.includes(RolesIntegerMap[role])) {
					return res.status(403).json({
						code: 403,
						status: "forbidden",
						msg: "Access denied",
					})
				}

				next()
			} catch (error) {
				logger.error(error, req)
				return res.status(500).json({
					code: 500,
					status: "error",
					msg: "Internal server error",
				})
			}
		}
	},
}

module.exports = { roleHandler, Roles }
