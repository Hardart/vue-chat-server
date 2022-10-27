const TokenModel = require('../models/token-model')
const jwt = require('jsonwebtoken')

class TokenService {
   generateTokens(payload) {
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '30m' })
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '1d' })
      return {
         accessToken,
         refreshToken,
      }
   }

   async saveRefreshToken(userId, refreshToken) {
      const tokenData = await TokenModel.findOne({ user: userId })
      if (tokenData) {
         tokenData.refreshToken = refreshToken
         return tokenData.save()
      }
      const token = await TokenModel.create({ user: userId, refreshToken })
      return token
   }

   async clearToken(refreshToken) {
      const tokenData = await TokenModel.deleteOne({ refreshToken })
      return tokenData
   }

   async getToken(refreshToken) {
      const tokenData = await TokenModel.findOne({ refreshToken })
      return tokenData
   }

   validateAccessToken(token) {
      try {
         const userData = jwt.verify(token, process.env.ACCESS_TOKEN)
         return userData
      } catch (error) {
         return null
      }
   }

   validateRefreshToken(token) {
      try {
         const userData = jwt.verify(token, process.env.REFRESH_TOKEN)
         return userData
      } catch (error) {
         return null
      }
   }
}

module.exports = new TokenService()
