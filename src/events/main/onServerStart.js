const onServerStart = async () => {
	try {
	} catch (error) {
		global.activities = []
		console.log("ERROR onServerStart", error)
	}
}

module.exports = onServerStart
