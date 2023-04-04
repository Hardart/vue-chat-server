const ErrorApi = require('../handlers/error-api')
// const roomService = require('../service/room-service')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return next(ErrorApi.UnathorizedError())

  const accessToken = authHeader.split(' ')[1]
  if (!accessToken) return next(ErrorApi.UnathorizedError())

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) return next(ErrorApi.UnathorizedError())

  // roomService.addUser(userData.id)
  req.user = { id: userData.id, email: userData.email, name: userData.name, roles: userData.roles }
  next()
}
