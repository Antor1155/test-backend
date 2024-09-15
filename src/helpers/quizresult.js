const { QuizResult } = require("../models")
const { generateDateQuery } = require("./utils")
const mongoose = require("mongoose")

module.exports = {
	createQuizResult: async (body) => {
		try {
			const data = await QuizResult.create(body)

			return data
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	getQuizResult: async (filter, option, populate) => {
		try {
			const data = await QuizResult.findOne(filter, option).populate(populate)

			return data
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	updateQuizResult: async (filter, body) => {
		try {
			const data = await QuizResult.findOneAndUpdate(filter, body, {
				new: true,
			})

			return data
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	deleteQuizResult: async (filter) => {
		try {
			const data = await QuizResult.findOneAndDelete(filter)

			return data
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	listQuizResult: async ({
		offset,
		limit,
		currentPage,
		date_from,
		date_to,
		user,
		sort_order,
		sort_by,
	}) => {
		let filter = {
			$match: {},
		}

		if (date_from || date_to) {
			filter.$match.createdAt = generateDateQuery(date_from, date_to)
		}

		if (user) {
			filter.$match.user = new mongoose.Types.ObjectId(user)
		}

		sort_order = sort_order === "asc" ? 1 : -1
		sort_by = sort_by || "createdAt"

		try {
			const pipeline = [
				filter,
				{
					$sort: {
						[sort_by]: sort_order,
					},
				},
				{
					$lookup: {
						from: "user",
						localField: "user",
						foreignField: "_id",
						as: "user",
					},
				},
				{
					$unwind: {
						path: "$user",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: "quiz",
						localField: "quiz",
						foreignField: "_id",
						as: "quiz",
					},
				},
				{
					$unwind: {
						path: "$quiz",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						_id: 1,
						user: {
							_id: 1,
							name: 1,
							email: 1,
						},
						score: 1,
						createdAt: 1,
						quiz: {
							_id: 1,
							title: 1,
						},
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						results: { $push: "$$ROOT" },
					},
				},
				{
					$project: {
						_id: 0,
						total: 1,
						results: { $slice: ["$results", offset, limit] },
					},
				},
			]

			let docs = await QuizResult.aggregate(pipeline)

			if (docs.length === 0) {
				return {
					results: [],
				}
			}

			docs = docs[0]
			const last_page = Math.ceil(docs.total / limit)
			return {
				first_page: currentPage === 1 ? null : 1,
				previous: currentPage === 1 ? null : currentPage - 1,
				next: offset + limit >= docs.total ? null : currentPage + 1,
				last_page: last_page === currentPage ? null : last_page,
				size: Array.isArray(docs.results) ? docs.results.length : null,
				...docs,
			}
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	calculateResult: async ({ sum, avg, date_from, date_to, user }) => {
		let filter = {
			$match: {},
		}

		if (date_from || date_to) {
			filter.$match.createdAt = generateDateQuery(date_from, date_to)
		}

		if (user) {
			filter.$match.user = new mongoose.Types.ObjectId(user)
		}

		try {
			// if avg is true, calculate the average score of all quiz results that match the filter
			// if sum is true, calculate the sum of all quiz results that match the filter
			// using the aggregate method

			const pipeline = [filter]

			if (avg) {
				pipeline.push({
					$group: {
						_id: null,
						avg: { $avg: "$score" },
					},
				})
			}

			if (sum) {
				pipeline.push({
					$group: {
						_id: null,
						sum: { $sum: "$score" },
					},
				})
			}

			const docs = await QuizResult.aggregate(pipeline)

			if (docs.length === 0) {
				return {
					data: null,
				}
			}

			return docs[0]
		} catch (error) {
			console.log(error.message)
			return null
		}
	},

	findQuizResult: async (filter) => {
		try {
			const data = await QuizResult.find(filter)

			return data
		} catch (error) {
			console.log(error.message)
			return null
		}
	},
}
