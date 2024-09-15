const fs = require("fs")
const path = require("path")
// const { createHash } = require("crypto");
// const libphonenumberJs = require("libphonenumber-js");
// const normalizeEmail = require("normalize-email");
const moment = require("moment")
// const hash = require("object-hash");
// const xlsx = require("xlsx");
// const jwt = require("jsonwebtoken");
// const { convert } = require("html-to-text");

const utils = {
	calcDaysBetweenTwoDates: ({ from, to }) => {
		/**
		 * from, to both are Date
		 */
		return Math.floor((to - from) / (1000 * 60 * 60 * 24))
	},

	addLearningDays: (date, daysToAdd, weekends = []) => {
		if (!date) return null

		let momentDate = moment(new Date(date))
		momentDate = momentDate.add(daysToAdd, "days")

		if (weekends.length) {
			const momentWeekends = []
			for (const d of weekends) {
				momentWeekends.push(moment().day(d).weekday())
			}
			if (momentWeekends.includes(momentDate.weekday())) {
				while (true) {
					momentDate = momentDate.add(1, "days")
					if (momentWeekends.includes(momentDate.weekday())) continue
					break
				}
			}
		}

		return momentDate
	},
	getRequestPlatform: (req) => {
		const header = req?.headers?.["x-ph-app"]
		if (!header) return "Website"
		if (header.includes("com.ph.android")) return "Android"
		if (header.includes("com.ph.ios")) return "iOS"
		if (header.includes("com.ph.windows")) return "Windows"
		if (header.includes("com.ph.macos")) return "macOS"
		if (header.includes("com.ph.linux")) return "Linux"
		if (header.includes("com.ph")) return header
	},
	errorHandler: (err, req, res, next) => {
		const statusCode = err.code || 500

		const statusMsg = err.status || "failed"

		let errorMessage = err.message || "Internal Server Error"

		// Check if the error is a ReferenceError
		if (typeof err === "function" && err.name === "ReferenceError") {
			errorMessage = "Reference Error"
		}

		return res.status(statusCode).json({
			code: statusCode,
			msg: errorMessage,
			status: statusMsg,
		})
	},
	asyncWrapper: (fn) => {
		return (req, res, next) => {
			Promise.resolve(fn(req, res, next)).catch((error) => {
				logger.error(error, req)
				next(error)
			})
		}
	},
	generateDateQuery: (date_from, date_to) => {
		const date_from_moment = moment(date_from).startOf("day").toDate()
		const date_to_moment = moment(date_to).endOf("day").toDate()
		if (date_from && date_to)
			return { $gte: date_from_moment, $lte: date_to_moment }
		if (date_from)
			return {
				$gte: date_from_moment,
				$lt: moment(date_from_moment).add(1, "days").toDate(),
			}
		if (date_to)
			return {
				$gte: date_to_moment,
				$lt: moment(date_to_moment).add(1, "days").toDate(),
			}
		return null
	},
}

module.exports = utils
