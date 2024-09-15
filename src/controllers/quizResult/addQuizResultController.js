const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { createQuizResult } = require("../../helpers/quizresult")

const addQuizResultController = async (req, res) => {
	const { quiz, user, score } = req.body

	const create = await createQuizResult({
		quiz,
		user,
		score,
	})

	if (!create) {
		throw new CustomError({
			code: 400,
			status: "failed",
			msg: "Failed to create quiz result",
		})
	}

	const response = new GeneralResponse({
		msg: "quiz result created successfully",
	})
	res.json(response)
}

module.exports = addQuizResultController
