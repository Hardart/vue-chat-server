const fs = require('fs')

function cancelUploadAvatar(req, res, next) {
  fs.unlink(`./${req.body.avatar.path}`, function (err) {
    if (err) return console.log(err)
  })

  req.delete = true
  next()
}

module.exports = cancelUploadAvatar
