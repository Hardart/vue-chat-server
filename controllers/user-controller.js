require('dotenv').config()
const userService = require('../service/user-service')
const { validationResult } = require('express-validator')
const ErrorApi = require('../handlers/error-api')

class UserController {
  async registration(req, res, next) {
    try {
      const validErrors = validationResult(req)
      const avatar = process.env.AVATAR
      if (!validErrors.isEmpty()) return next(ErrorApi.BadRequest('Ошибка при валидации', validErrors.array()))
      const { email, password, name = 'Гость', roles = ['user'] } = req.body
      const { accessToken, refreshToken, user } = await userService.registration(email, password, name, roles, avatar)
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.status(200).json({ accessToken, user })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const validErrors = validationResult(req)
      if (!validErrors.isEmpty()) return next(ErrorApi.BadRequest('Ошибка при валидации', validErrors.array()))
      const { email, password } = req.body
      const { accessToken, refreshToken } = await userService.login(email, password)
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.status(200).json({ accessToken })
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      await userService.logout(refreshToken)
      return res.status(200).json({ res: 'ok' })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const tokenData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', tokenData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.status(200).json({ accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken })
    } catch (error) {
      return res.status(200).json({ message: 'пользователь не авторизован' })
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAll()
      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }

  async getOnlineUsers(req, res, next) {
    try {
      const users = await userService.getOnline()
      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }

  async check(req, res, next) {
    try {
      if (!req.user) return next(ErrorApi.UnathorizedError())
      return res.status(200).json({ res: 'ok' })
    } catch (error) {
      next(error)
    }
  }

  async changeName(req, res, next) {
    try {
      const newName = req.body.name
      const { accessToken } = await userService.changeName(req.user, newName)

      return res.status(200).json({ accessToken })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new UserController()
