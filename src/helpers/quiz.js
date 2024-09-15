const { Quiz } = require("../models")

module.exports = {
	createQuiz: async (body) => {
		try {
			const quiz = new Quiz(body)
			const savedQuiz = await quiz.save()
			return savedQuiz
		} catch (error) {
			console.log(error)
			return null
		}
	},

	getQuiz: async (filter) => {
		try {
			const quiz = await Quiz.findOne(filter)

			return quiz
		} catch (error) {
			console.log(error)
			return null
		}
	},

	deleteQuiz: async (filter) => {
		try {
			const quiz = await Quiz.findOneAndDelete(filter)

			return quiz
		} catch (error) {
			console.log(error)
			return null
		}
	},

	updateQuiz: async (filter, body) => {
		try {
			const quiz = await Quiz.findOneAndUpdate(filter, body, {
				new: true,
			})

			return quiz
		} catch (error) {
			console.log(error)
			return error
		}
	},
}
