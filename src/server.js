require("dotenv").config()
const { app } = require("./app")
const chalk = require("chalk")

const PORT = process.env.PORT || 7000
app.listen(PORT, () => {
  if (process.env.DB_TLS == "true") {
    console.log(chalk.red(`SERVER IS CONNECTING TO PRODUCTION DATABASE`))
  } else {
    console.log(chalk.blue(`SERVER IS CONNECTING TO TEST DATABASE`))
  }
  logger.trace(`Server Running On Port ${PORT}`)
})
