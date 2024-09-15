const { verifyPassword, generateJwtToken } = require("../../helpers/authHelper")
const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { getUser } = require("../../helpers/user")

const userLoginController = async (req, res) => {
	const { email, password } = req.body

	const userExist = await getUser({ email })

	if (!userExist) {
		throw new CustomError({
			code: 404,
			status: "failed",
			msg: "User not found",
		})
	}

	const isPasswordCorrect = await verifyPassword(password, userExist.password)

	if (!isPasswordCorrect) {
		throw new CustomError({
			code: 400,
			status: "failed",
			msg: "Invalid password",
		})
	}

	const tokens = generateJwtToken(userExist)

	const response = new GeneralResponse({
		msg: "User logged in",
		data: tokens,
	})
	res.json(response)
}

module.exports = userLoginController
