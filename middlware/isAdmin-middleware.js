const ErrorApi = require('../handlers/error-api')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
   const authHeader = req.headers.authorization
   if (!authHeader) return next(ErrorApi.UnathorizedError())

   const accessToken = authHeader.split(' ')[1]
   if (!accessToken) return next(ErrorApi.UnathorizedError())

   const userData = tokenService.validateAccessToken(accessToken)
   if (!userData) return next(ErrorApi.UnathorizedError())
   if (userData.roles.some((role) => role != 'admin')) return next(ErrorApi.AccessDenied())

   next()
}
