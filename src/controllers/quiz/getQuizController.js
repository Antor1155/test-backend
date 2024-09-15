const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { getQuiz } = require("../../helpers/quiz")

const getQuizController = async (req, res) => {
	const { quizId } = req.params

	const data = await getQuiz({ _id: quizId })

	if (!data) {
		throw new CustomError({
			msg: "Failed to get quiz",
			code: 400,
			status: "failed",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz fetched successfully",
		data: data,
	})

	res.json(response)
}

module.exports = getQuizController
