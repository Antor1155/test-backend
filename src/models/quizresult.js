const mongoose = require("mongoose")
const Schema = mongoose.Schema

const quizResultSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
			index: true,
		},
		quiz: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quiz",
			required: true,
			index: true,
		},
		score: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
		collection: "quizresult",
	},
)

module.exports = mongoose.model("quizresult", quizResultSchema)
