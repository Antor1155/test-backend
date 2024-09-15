const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { createQuiz } = require("../../helpers/quiz")

const createQuizController = async (req, res) => {
	const { title, questions } = req.body

	const create = await createQuiz({
		title,
		questions,
		created_by: req.user._id,
	})

	if (!create) {
		throw new CustomError({
			msg: "Failed to create quiz",
			code: 400,
			status: "failed",
		})
	}

	const response = new GeneralResponse({
		msg: "Quiz created",
	})

	res.json(response)
}

module.exports = createQuizController
