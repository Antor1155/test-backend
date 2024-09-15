const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { updateQuiz } = require("../../helpers/quiz")

const updateQuizController = async (req, res) => {
	const { quizId } = req.params

	const { title, questions } = req.body
	const update = await updateQuiz(
		{
			_id: quizId,
		},
		{ title, questions },
	)

	console.log({ update })

	if (!update) {
		throw new CustomError({
			msg: "Failed to update quiz",
			code: 400,
			status: "failed",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz updated",
	})

	res.json(response)
}

module.exports = updateQuizController
