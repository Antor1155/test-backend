const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { getQuizResult } = require("../../helpers/quizresult")

const getQuizResultController = async (req, res) => {
	const { quizResultId } = req.params
	const quizResult = await getQuizResult(
		{ _id: quizResultId },
		{
			answers: 0,
		},
		[
			{ path: "quiz", select: "title" },
			{ path: "user", select: "email" },
		],
	)

	if (!quizResult) {
		throw new CustomError({
			code: 404,
			status: "failed",
			msg: "Quiz result not found",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz result found",
		data: quizResult,
	})
	res.json(response)
}

module.exports = getQuizResultController
