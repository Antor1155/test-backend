class BaseResponse {
	constructor(code, status, msg, data) {
		this.code = code || 200
		this.status = status || "success"
		this.msg = msg || ""
		this.data = data
	}
}

module.exports = BaseResponse
