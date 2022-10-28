require('dotenv').config()
const sharp = require('sharp')
const UserModel = require('../../models/user-model')
const MessageModel = require('../../models/message-model')

async function resize(req, res, next) {
  if (req.body.avatar) {
    const fullImage = req.body.avatar

    // const path = image.path.match(/(.*)\./)[1] // путь файла без расширения
    // console.log(`PATH: ${image.path}`)
    // const ext = image.path.match(/\.(.*)/)[0] // расширение -> .jpg
    // const newName = `${path}_avatar${ext}`
    const publicPath = fullImage.path.split('.').join('_avatar.')
    const exctractTop = Math.round((fullImage.newH - fullImage.borderWidth) / 2 - fullImage.posY)
    const exctractLeft = Math.round((fullImage.newW - fullImage.borderWidth) / 2 - fullImage.posX)

    const buff = await sharp(`./${fullImage.path}`)
      .resize({
        width: Math.ceil(fullImage.newW),
        height: Math.ceil(fullImage.newH)
      })
      .extract({
        left: exctractLeft,
        top: exctractTop,
        width: Math.round(fullImage.borderWidth),
        height: Math.round(fullImage.borderWidth)
      })
      .toBuffer()

    await sharp(buff)
      .resize({
        width: 200,
        height: 200
      })
      .toFile(publicPath)

    const relativePath = publicPath.match(/[^public].+/g)[0]

    const user = await UserModel.findOne({ _id: req.user.id })
    user.avatar = relativePath
    await user.save()
    await MessageModel.updateMany({ userID: user.chatID }, { userAvatar: relativePath })
    req.user = user
    req.resizing = true
  }

  next()
}

module.exports = resize
