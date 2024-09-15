// helpers/authHelper.js
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const hashPassword = async (password) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 10)
		return hashedPassword
	} catch (error) {
		throw new Error("Error hashing password")
	}
}

const generateJwtToken = (user, expiresIn = "1h") => {
	try {
		user = user?.toObject()

		const accessToken = jwt.sign({ ...user }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn,
		})

		const refreshToken = jwt.sign(
			{
				email: user.email,
				role: user.role,
			},
			process.env.REFRESH_TOKEN_SECRET,
			{
				expiresIn: "7d",
			},
		)

		return { accessToken, refreshToken }
	} catch (error) {
		console.log(error)
		throw new Error("Error generating token")
	}
}

const verifyPassword = async (password, hashedPassword) => {
	try {
		const isPasswordCorrect = await bcrypt.compare(password, hashedPassword)
		return isPasswordCorrect
	} catch (error) {
		throw new Error("Error verifying password")
	}
}

module.exports = { hashPassword, generateJwtToken, verifyPassword }
