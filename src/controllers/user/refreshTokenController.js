const jwt = require("jsonwebtoken")
const { getUser } = require("../../helpers/user")
const CustomError = require("../../helpers/customError")
const { generateJwtToken } = require("../../helpers/authHelper")
const { GeneralResponse } = require("../../helpers/GeneralResponse")

const refreshTokenController = async (req, res) => {
	const refreshToken = req.headers.refreshtoken

	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		async (err, user) => {
			if (err) {
				throw new CustomError({
					code: 403,
					status: "failed",
					msg: "Invalid token",
				})
			}

			const userExist = await getUser({ email: user.email })

			if (!userExist) {
				throw new CustomError({
					code: 400,
					status: "failed",
					msg: "User not found",
				})
			}

			const tokens = generateJwtToken(userExist)

			const response = new GeneralResponse({
				msg: "Token refreshed",
				data: tokens,
			})

			res.json(response)
		},
	)
}

module.exports = refreshTokenController
