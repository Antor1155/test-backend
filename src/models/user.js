const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: Number,
			min: 0,
			max: 10,
			default: 0,
			required: true,
		},
	},
	{
		timestamps: true,
		collection: "user",
	},
)

module.exports = mongoose.model("user", userSchema)
