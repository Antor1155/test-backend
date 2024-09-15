const express = require("express")
const router = express.Router()

const {
	createQuizController,
	getQuizController,
	updateQuizController,
	deleteQuizController,
} = require("../controllers")
const { authenticatedRequest } = require("../middlewares/authenticatedRequest")
const { roleHandler, Roles } = require("../middlewares/roleHandler")
const { validateRequest } = require("../middlewares/validateRequest")
const { asyncWrapper } = require("../helpers/utils")

router.post(
	"/",
	authenticatedRequest.must,
	roleHandler.multiple([Roles.ADMIN]),
	validateRequest({
		check_from: "body",
		mustKeys: ["title"],
		validKeys: ["questions"],
	}),
	asyncWrapper(createQuizController),
)

router.get(
	"/:quizId",
	authenticatedRequest.must,
	roleHandler.multiple([Roles.ADMIN]),
	asyncWrapper(getQuizController),
)

router.patch(
	"/:quizId",
	authenticatedRequest.must,
	roleHandler.multiple([Roles.ADMIN]),
	validateRequest({
		check_from: "body",
		mustKeys: [],
		validKeys: ["questions", "title"],
	}),
	asyncWrapper(updateQuizController),
)

router.delete(
	"/:quizId",
	authenticatedRequest.must,
	roleHandler.multiple([Roles.ADMIN]),
	asyncWrapper(deleteQuizController),
)

module.exports = router
