const express = require("express")
const { asyncWrapper } = require("../helpers/utils")
const {
	userLoginController,
	userSignupController,
	refreshTokenController,
} = require("../controllers/user")
const { validateRequest } = require("../middlewares/validateRequest")
const { authenticatedRequest } = require("../middlewares/authenticatedRequest")
const router = express.Router()

router
	.post(
		"/login",
		validateRequest({
			check_from: "body",
			mustKeys: ["email", "password"],
			validKeys: [],
		}),
		asyncWrapper(userLoginController),
	)
	.post(
		"/signup",
		validateRequest({
			check_from: "body",
			mustKeys: ["email", "password"],
			validKeys: [],
		}),
		asyncWrapper(userSignupController),
	)
	.post(
		"/refresh-token",
		authenticatedRequest.must,
		asyncWrapper(refreshTokenController),
	)

module.exports = router
