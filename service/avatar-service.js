const tokenService = require('../service/token-service')
const imageInfo = require('image-size')

class AvatarService {
  async upload(_, file) {
    const result = imageInfo('./' + file.path)
    file.width = result.width
    file.height = result.height
    file.path = file.path.replace('public/', '')
    return file
  }

  async changeAvatar(user) {
    const { _id, name, email, roles, chatID, avatar } = user
    const tokens = tokenService.generateTokens({ id: _id, email, name, roles, chatID, avatar })
    await tokenService.saveRefreshToken(_id, tokens.refreshToken)
    return { ...tokens }
  }
}

module.exports = new AvatarService()
