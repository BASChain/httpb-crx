const currVER = process.env.CURRENT_VERSION || '1.0.0'

module.exports = {
  version:currVER,
  buildTime:new Date().getTime()
}