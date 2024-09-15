const BaseResponse = require("./baseResponse")

class GeneralResponse extends BaseResponse {
	constructor({ code, status, msg, data }) {
		super(code, status, msg, data)
	}

	sendResponse(res) {
		return res.status(this.code).json({
			code: this.code,
			status: this.status,
			msg: this.msg,
			data: this.data,
		})
	}
}
module.exports = { GeneralResponse }
