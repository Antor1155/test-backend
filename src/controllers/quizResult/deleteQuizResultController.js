const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { deleteQuizResult } = require("../../helpers/quizresult")

const deleteQuizResultController = async (req, res) => {
	const { quizResultId } = req.params

	const quizResult = await deleteQuizResult({ _id: quizResultId })

	if (!quizResult) {
		throw new CustomError({
			code: 404,
			status: "failed",
			msg: "Quiz result not found",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz result deleted",
		data: quizResult,
	})
	res.json(response)
}

module.exports = deleteQuizResultController
