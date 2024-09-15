const { hashPassword, generateJwtToken } = require("../../helpers/authHelper")
const CustomError = require("../../helpers/customError")
const { GeneralResponse } = require("../../helpers/GeneralResponse")
const { getUser, createUser } = require("../../helpers/user")

const userSignupController = async (req, res) => {
	const { email, password } = req.body

	const userExist = await getUser({ email })

	if (userExist) {
		throw new CustomError({
			code: 400,
			status: "failed",
			msg: "User already exist",
		})
	}

	const hashedPassword = await hashPassword(password)

	const newUser = await createUser({ email, password: hashedPassword })

	const tokens = generateJwtToken(newUser)

	const response = new GeneralResponse({
		msg: "User signed up",
		data: tokens,
	})
	res.json(response)
}

module.exports = userSignupController
