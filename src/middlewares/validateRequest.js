const validateRequest = ({
	check_from,
	mustKeys = [],
	validKeys = [],
	// validate = [],
	validEnums = [],
}) => {
	return (req, res, next) => {
		try {
			const keys =
				check_from === "body" ? Object.keys(req.body) : Object.keys(req.query)

			if (!keys) throw new Error("Keys are required")

			if (!Array.isArray(validKeys))
				throw new Error("Valid keys must be an array")
			if (!Array.isArray(mustKeys))
				throw new Error("Must keys must be an array")

			if (keys.length > validKeys.length + mustKeys.length) {
				throw new Error("Unexpected key in body")
			}

			keys.forEach((key) => {
				if (!validKeys.includes(key) && !mustKeys.includes(key)) {
					throw new Error(`Unexpected key: ${key} in body`)
				}
			})

			mustKeys.forEach((key) => {
				if (!keys.includes(key)) {
					throw new Error(`Missing field: ${key}`)
				}

				//check if the key is not empty
				if (!req[check_from][key]) {
					throw new Error(`Field ${key.toUpperCase()} cannot be empty`)
				}
			})

			const hasPageAndCount =
				validKeys.includes("page") && validKeys.includes("count")

			if (hasPageAndCount) {
				const page = req.query.page
					? parseInt(req.query.page)
					: req.body.page
					? parseInt(req.body.page)
					: 1
				const count = req.query.count
					? parseInt(req.query.count)
					: req.body.count
					? parseInt(req.body.count)
					: 10
				const offset = (page - 1) * count

				req.query.page = page
				req.query.limit = count
				req.query.offset = offset
			}

			for (const validEnum of validEnums) {
				const { field, enum: validEnumValues } = validEnum

				if (req[check_from][field]) {
					req[check_from][field].forEach((v) => {
						if (!validEnumValues.includes(v)) {
							throw new Error(`Invalid ${field} value`)
						}
					})
				}
			}

			next()
		} catch (error) {
			res.status(400).send({
				code: 400,
				msg: error.message,
				status: "failed",
			})
		}
	}
}

module.exports = { validateRequest }
