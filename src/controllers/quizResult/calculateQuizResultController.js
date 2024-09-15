const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { calculateResult } = require("../../helpers/quizresult")

const calculateQuizResultController = async (req, res) => {
	const { sum, avg } = req.query

	if (!sum && !avg) {
		throw new CustomError({
			code: 400,
			status: "failed",
			msg: "Please provide sum or avg",
		})
	}

	if (sum && avg) {
		throw new CustomError({
			code: 400,
			status: "failed",
			msg: "Please provide sum or avg, not both",
		})
	}

	const data = await calculateResult({
		...req.query,
	})

	const response = new GeneralResponse({
		code: 200,
		status: "success",
		data,
	})

	res.json(response)
}

module.exports = calculateQuizResultController
