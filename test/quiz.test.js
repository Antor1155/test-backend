require("../src/configs/test.config")
const request = require("supertest")
require("dotenv").config()

const Quiz = require("../src/models/quiz")
const User = require("../src/models/user")

const { app } = require("../src/app")
const { generateJwtToken } = require("../src/helpers/authHelper")
const { getUser } = require("../src/helpers/user")
const { getQuiz } = require("../src/helpers/quiz")

beforeEach(async () => {
	console.log("Before each")
})

test("Add quiz: pass", async () => {
	const quiz = {
		questions: [
			{
				question: "What is 1+1?",
				options: [
					{
						option: "1",
						is_correct: false,
					},
					{
						option: "2",
						is_correct: true,
					},
					{
						option: "3",
						is_correct: false,
					},
					{
						option: "4",
						is_correct: false,
					},
				],
			},
		],
		title: "Simple Math Quiz",
	}

	const tokens = generateJwtToken({
		_id: "6664064d57953a0ba47fc6fb",
		role: 10,
		email: "ratul0947@gmail.com",
	})

	const { _body: body } = await request(app)
		.post("/quiz")
		.set("accesstoken", tokens.accessToken)
		.send(quiz)

	expect(body.code).toBe(200)
	expect(body.status).toBe("success")
	expect(body.msg).toBe("Quiz created")

	console.log({ body })
})
