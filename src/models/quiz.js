const mongoose = require("mongoose")
const Schema = mongoose.Schema

const quizSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},

		questions: {
			type: [
				{
					question: {
						type: String,
						required: true,
					},
					options: {
						type: [
							{
								option: {
									type: String,
									required: true,
								},
								is_correct: {
									type: Boolean,
									required: true,
								},
							},
						],
						_id: false,
						default: [],
					},
				},
			],
			_id: false,
			default: [],
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
	},
	{
		timestamps: true,
		collection: "quiz",
	},
)

module.exports = mongoose.model("quiz", quizSchema)
