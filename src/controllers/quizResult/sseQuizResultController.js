const { findQuizResult } = require("../../helpers/quizresult")

const sseQuizResultController = async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream")
	res.setHeader("Cache-Control", "no-cache")
	res.setHeader("Connection", "keep-alive")
	res.flushHeaders()

	const data = await findQuizResult({
		...req.query,
	})

	if (!data) {
		res.write("data: null\n\n")
		res.end()
	}

	for (let i = 0; i < data.length; i++) {
		res.write(`data: ${JSON.stringify(data[i]?.score)}\n\n`)

		// simulate a delay
		await new Promise((resolve) => setTimeout(resolve, 1 * 1000))
	}

	res.end()
}

module.exports = sseQuizResultController
