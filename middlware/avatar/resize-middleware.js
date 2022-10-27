require('dotenv').config()
const sharp = require('sharp')
const UserModel = require('../../models/user-model')
const MessageModel = require('../../models/message-model')

async function resize(req, res, next) {
  if (req.body.avatar) {
    const image = req.body.avatar

    const path = image.path.match(/(.*)\./)[1] // путь файла без расширения
    const ext = image.path.match(/\.(.*)/)[0] // расширение -> .jpg
    const newName = `${path}_avatar${ext}`
    const exctractTop = Math.round((image.newH - image.borderWidth) / 2 - image.posY)
    const exctractLeft = Math.round((image.newW - image.borderWidth) / 2 - image.posX)

    const buff = await sharp(`./${image.path}`)
      .resize({
        width: Math.ceil(image.newW),
        height: Math.ceil(image.newH)
      })
      .extract({
        left: exctractLeft,
        top: exctractTop,
        width: Math.round(image.borderWidth),
        height: Math.round(image.borderWidth)
      })
      .toBuffer()

    await sharp(buff)
      .resize({
        width: 200,
        height: 200
      })
      .toFile(newName)

    req.resize = { path: newName.match(/public\/(.*)/)[1] }

    const user = await UserModel.findOne({ _id: req.user.id })
    user.avatar = req.resize.path
    await user.save()
    await MessageModel.updateMany({ userID: user.chatID }, { userAvatar: process.env.SERVER_URL + '/' + req.resize.path })
    req.user = user
  }

  next()
}

module.exports = resize
