class CustomError extends Error {
	constructor({ code, status, msg }) {
		super(msg)
		this.code = code || 400
		this.status = status || "failed"
	}
}

module.exports = CustomError
