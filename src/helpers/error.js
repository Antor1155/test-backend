const getErrorLine = (error) => {
	try {
		if (!error || !error.stack) throw error
		let caller_line = error.stack?.split("\n")[1]
		let clean = caller_line?.split(":")
		let fileName = clean[clean.length - 3]?.split("\\")
		clean[clean.length - 1] = clean[clean.length - 1]?.replace(")", "")
		let cleaner = [clean[clean.length - 2], clean[clean.length - 1]]
		return `${fileName[fileName.length - 1]}(${cleaner[0]}:${cleaner[1]}) - `
	} catch (err) {
		return err
	}
}

module.exports = getErrorLine
