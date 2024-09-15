require("dotenv").config()
const mongoose = require("mongoose")
const { Events } = require("../../events/constants")

mongoose
  .connect(process.env.TEST_DB_URI, {
    dbName: process.env.TEST_DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.trace("mongodb connected without TLS!")
    ee.emit(Events.ON_SERVER_START)
  })
  .catch((error) => {
    error.message = "MongoDB error: " + error.message
    logger.error(error)
  })

mongoose.set("useNewUrlParser", true)
mongoose.set("useFindAndModify", false)
mongoose.set("useCreateIndex", true)
mongoose.set("useUnifiedTopology", true)

mongoose.connection.on("connected", () => {
  logger.trace("Mongoose connected to DB")
})

mongoose.connection.on("error", (error) => {
  error.message = "Mongoose error: " + error.message
  logger.error(error)
})

mongoose.connection.on("disconnected", () => {
  logger.info("Mongoose connection is disconnected")
})

process.on("SIGINT", async () => {
  await mongoose.connection.close()
  process.exit(0)
})
