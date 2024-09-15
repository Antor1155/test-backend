const { User } = require("../models")

module.exports = {
	getUser: async (filter) => {
		try {
			const user = await User.findOne(filter)

			return user
		} catch (error) {
			console.log(error)
			return null
		}
	},

	createUser: async (data) => {
		try {
			const user = await User.create(data)

			return user
		} catch (error) {
			console.log(error)
			return null
		}
	},

	updateUser: async (filter, data) => {
		try {
			const user = await User.findOneAndUpdate(filter, data, {
				new: true,
			})
		} catch (error) {
			console.log(error)
			return null
		}
	},

	deleteUser: async (filter) => {
		try {
			const user = await User.findOneAndDelete(filter)

			return user
		} catch (error) {
			console.log(error)
			return null
		}
	},
}
