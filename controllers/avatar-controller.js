const avatarService = require('../service/avatar-service')

class AvatarController {
  async upload(req, res) {
    if (!req.file) return res.send({ error: 'upload image error' })

    const file = await avatarService.upload(req.user, req.file)
    return res.json(file)
  }

  async resize(req, res) {
    if (req.resize) {
      const { accessToken, refreshToken } = await avatarService.changeAvatar(req.user)
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.status(200).json({ accessToken })
    }
    res.send({ status: 'error' })
  }

  async uploadTest(req, res) {
    if (!req.file) return res.send({ error: 'upload image error' })
    console.log(req.file)
    return res.json({ status: 'ok' })
  }

  delete(req, res) {
    if (req.delete) return res.send({ status: 'ok' })
    res.send({ status: 'error' })
  }
}

module.exports = new AvatarController()
