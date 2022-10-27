const Router = require('express').Router
const router = new Router()
const upload = require('../middlware/avatar/upload-middleware')
const simpleUpload = require('../middlware/avatar/simpleUpload-middleware')
const resize = require('../middlware/avatar/resize-middleware')
const deleteFullSizeImage = require('../middlware/avatar/delete-middleware')
const cancel = require('../middlware/avatar/cancel-middleware')
const authCheck = require('../middlware/auth-middleware')

const avatarController = require('../controllers/avatar-controller')

router.post('/avatar', authCheck, upload.single('avatar'), avatarController.upload)
router.post('/resize', authCheck, resize, deleteFullSizeImage, avatarController.resize)
router.post('/cancel', cancel, avatarController.delete)
router.post('/test', simpleUpload.single('image'), avatarController.uploadTest)

//upload files

module.exports = router
