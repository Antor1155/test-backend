const { Events } = require("../constants")
const onServerStart = require("./onServerStart")

ee.once(Events.ON_SERVER_START, onServerStart)
