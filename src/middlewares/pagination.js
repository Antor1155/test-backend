module.exports = {
	paginationDto: (req, res, next) => {
		try {
			let query = req.query ? req.query : req.body
			let page = query.page ? parseInt(query.page) : 1
			let count = query.count ? parseInt(query.count) : 10
			let offset = (page - 1) * count

			req.pagination = {
				page,
				count,
				offset,
			}
			next()
		} catch (error) {
			return res.status(400).json({
				code: 400,
				status: "Bad Request",
				msg: "Invalid query parameters",
			})
		}
	},
}
