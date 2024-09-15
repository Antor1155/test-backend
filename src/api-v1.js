const express = require("express")
const router = express.Router()
const RouteManager = require("./routes")

router.use("/quiz-result", RouteManager.QuizResult)
router.use("/user", RouteManager.User)
router.use("/quiz", RouteManager.Quiz)

module.exports = router
