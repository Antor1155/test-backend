const express = require("express")
const router = express.Router()

const {
	addQuizResultController,
	getQuizResultController,
	updateQuizResultController,
	deleteQuizResultController,
	listQuizResultController,
	calculateQuizResultController,
	sseQuizResultController,
} = require("../controllers")
const { asyncWrapper } = require("../helpers/utils")
const { validateRequest } = require("../middlewares/validateRequest")
const { authenticatedRequest } = require("../middlewares/authenticatedRequest")
const { roleHandler, Roles } = require("../middlewares/roleHandler")

router
	.get(
		"/",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		validateRequest({
			check_from: "query",
			mustKeys: [],
			validKeys: ["page", "count", "date_from", "date_to", "user"],
		}),
		asyncWrapper(listQuizResultController),
	)
	.get(
		"/sse",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.TEACHER]),
		validateRequest({
			check_from: "query",
			mustKeys: [],
			validKeys: ["user"],
		}),
		asyncWrapper(sseQuizResultController),
	)
	.get(
		"/calculate",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		validateRequest({
			check_from: "query",
			mustKeys: [],
			validKeys: ["date_from", "date_to", "user", "sum", "avg"],
		}),
		asyncWrapper(calculateQuizResultController),
	)
	.get(
		"/:quizResultId",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		asyncWrapper(getQuizResultController),
	)
	.post(
		"/",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		validateRequest({
			check_from: "body",
			mustKeys: ["quiz", "user", "score"],
			validKeys: [],
		}),
		asyncWrapper(addQuizResultController),
	)
	.patch(
		"/:quizResultId",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		validateRequest({
			check_from: "body",
			mustKeys: [],
			validKeys: ["quiz", "user", "score"],
		}),
		asyncWrapper(updateQuizResultController),
	)
	.delete(
		"/:quizResultId",
		authenticatedRequest.must,
		roleHandler.multiple([Roles.ADMIN]),
		asyncWrapper(deleteQuizResultController),
	)

module.exports = router
