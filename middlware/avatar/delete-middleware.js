const fs = require('fs')

function deleteFullSizeImage(req, res, next) {
  fs.unlink(`./${req.body.avatar.path}`, function (err) {
    if (err) return console.log(err)
  })
  fs.unlink(`./${req.body.avatar.oldPath}`, function (err) {
    if (err) return console.log(err)
  })

  req.delete = true
  next()
}

module.exports = deleteFullSizeImage
