const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { deleteQuiz } = require("../../helpers/quiz")

const deleteQuizController = async (req, res) => {
	const { quizId } = req.params

	const data = await deleteQuiz({ _id: quizId })

	if (!data) {
		throw new CustomError({
			msg: "Failed to delete quiz",
			code: 400,
			status: "failed",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz deleted",
	})

	res.json(response)
}

module.exports = deleteQuizController
