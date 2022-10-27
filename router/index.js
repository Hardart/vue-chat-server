const Router = require('express').Router
const router = new Router()
const authCheck = require('../middlware/auth-middleware')
const isAdmin = require('../middlware/isAdmin-middleware')
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 3, max: 32 }), userController.registration)
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 3, max: 32 }), userController.login)
router.post('/changeName', authCheck, userController.changeName)
router.get('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/users', isAdmin, userController.getUsers)
router.get('/onlineUsers', userController.getOnlineUsers)
router.get('/check', authCheck, userController.check)

module.exports = router
