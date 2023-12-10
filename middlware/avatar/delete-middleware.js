const fs = require('fs')

function deleteFullSizeImage(req, res, next) {
  const { path, oldPath } = req.body?.avatar

  fs.unlink(`./public/${path}`, function (err) {
    if (err) return console.log(err)
  })
  fs.unlink(`./public/${oldPath}`, function (err) {
    if (err) return console.log(err)
  })
  req.delete = true
  next()
}

module.exports = deleteFullSizeImage
