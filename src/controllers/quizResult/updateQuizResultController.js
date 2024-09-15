const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { updateQuizResult } = require("../../helpers/quizresult")

const updateQuizResultContoller = async (req, res) => {
	const { quizResultId } = req.params

	const quizResult = await updateQuizResult({ _id: quizResultId }, req.body)

	if (!quizResult) {
		throw new CustomError({
			code: 404,
			status: "failed",
			msg: "Quiz cannot be updated",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz updated",
		data: quizResult,
	})
	res.json(response)
}

module.exports = updateQuizResultContoller
