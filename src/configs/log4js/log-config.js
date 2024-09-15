const path = require("path");

const logPath = path.resolve(rootDir + "/log");

try {
  require("fs").mkdirSync(logPath);
} catch (er) {}

const data = {
  configuration: {
    appenders: {
      cat: {
        type: "stdout",
        layout: {
          type: "pattern",
          pattern: "%m",
        },
      },
      dog: {
        type: "file",
        filename: `${logPath}/master-logs.log`,
        layout: {
          type: "pattern",
          pattern: "[master] [%d] [%p] %m",
        },
      },
    },
    categories: {
      default: {
        appenders: ["cat", "dog"],
        level: "trace",
      },
      panda: {
        appenders: ["cat"],
        level: "trace",
      },
    },
  },
};

/*
if (process.env.LOG_SERVER_HOST && process.env.LOG_SERVER_PORT) {
  data.configuration.appenders["fluent"] = {
    type: "log4js-fluent-appender",
    tag_prefix: `fluentd.backend-monolith.${process.env.NODE_ENV}`,
    options: {
      levelTag: true,
      host: process.env.LOG_SERVER_HOST,
      port: process.env.LOG_SERVER_PORT,
    },
  };
  data.configuration.categories.default.appenders.push("fluent");
}
*/

module.exports = data;
