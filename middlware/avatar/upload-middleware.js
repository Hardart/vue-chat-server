const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/img/avatars')
  },
  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname.match(/\.(.*)/)[0])
  },
})

module.exports = multer({ storage })
