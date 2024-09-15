const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { listQuizResult } = require("../../helpers/quizresult")

const listQuizResultController = async (req, res) => {
	const { page, count } = req.query

	const data = await listQuizResult({
		...req.query,
		limit: parseInt(count),
		currentPage: parseInt(page),
	})

	const response = new GeneralResponse({
		status: 200,
		message: "List of quiz results",
		data,
	})

	res.json(response)
}

module.exports = listQuizResultController
