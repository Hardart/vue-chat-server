require('dotenv').config()
const sharp = require('sharp')
const UserModel = require('../../models/user-model')
const AVATAR_RESIZE = 200
async function resize(req, res, next) {
  const { avatar } = req.body

  if (avatar) {
    const { left, top, width, height, bounds } = avatar.image
    const destinationPath = avatar.path.split('.').join('_avatar.')
    const buff = await sharp(`./public/${avatar.path}`)
      .resize({ width, height })
      .extract({
        top,
        left,
        width: bounds.width,
        height: bounds.height,
      })
      .toBuffer()

    await sharp(buff)
      .resize({
        width: AVATAR_RESIZE,
        height: AVATAR_RESIZE,
      })
      .toFile(`public/${destinationPath}`)

    const user = await UserModel.findOneAndUpdate({ _id: req.user.id }, { avatar: destinationPath }, { new: true })
    req.user = user
    req.resizing = true
  }

  next()
}

module.exports = resize
