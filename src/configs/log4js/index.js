const log4js = require('log4js')
const getErrorLine = require('../../helpers/error')
const { getRequestPlatform } = require('../../helpers/utils')
const { configuration } = require('./log-config')

log4js.configure(configuration)

const logOnFile = log4js.getLogger()
const logOnConsole = log4js.getLogger('panda')

module.exports = {
    error: (error, req = null) => {
        let message = getErrorLine(error) + error?.message
        if (req) {
            message = `${message} [source: ${getRequestPlatform(req)}, user: ${req.user?._id ? req.user._id : 'anonymous'}, phone: ${req.user?.phone} api: ${req.originalUrl} body: ${JSON.stringify(req.body)} query: ${JSON.stringify(req.query)}]`
        }
        logOnFile.error(message)
    },
    info: (info, req = null) => {
        if (req) {
            info = `${info} [source: ${getRequestPlatform(req)}, user: ${req.user?._id ? req.user._id : 'anonymous'}, phone: ${req.user?.phone} api: ${req.originalUrl} body: ${JSON.stringify(req.body)} query: ${JSON.stringify(req.query)}]`
        }
        logOnFile.info(info)
    },
    trace: (trace, req = null) => {
        if (req) {
            trace = `${trace} [source: ${req.headers['x-ostad-app'] || 'web'}, user: ${req.user?._id ? req.user._id : 'anonymous'} api: ${req.originalUrl} body: ${JSON.stringify(req.body)} query: ${JSON.stringify(req.query)}]`
        }
        logOnConsole.trace(trace)
    },
    debug: (debug, req = null) => {
        if (process.env.NODE_ENV !== 'production') {
            if (req) {
                debug = `${debug} [source: ${req.headers['x-ostad-app'] || 'web'}, user: ${req.user?._id ? req.user._id : 'anonymous'} api: ${req.originalUrl} body: ${JSON.stringify(req.body)} query: ${JSON.stringify(req.query)}]`
            }
            logOnConsole.debug(debug)
        }
    }
}