const bcrypt = require('bcryptjs')
const UserModel = require('../models/user-model')
const MessageModel = require('../models/message-model')
const tokenService = require('../service/token-service')
const roomService = require('./room-service')
const ErrorApi = require('../handlers/error-api')

class UserService {
  async registration(email, password, name, roles, avatar) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) throw ErrorApi.BadRequest(`Пользователь с адресом ${email} уже существует`)
    const hashPassword = await bcrypt.hash(password, 5)
    const chatID = (await UserModel.count()) + 1
    const { _id } = await UserModel.create({ email, password: hashPassword, name, roles, chatID, avatar })
    const tokens = tokenService.generateTokens({ id: _id, email, name, chatID, avatar })
    await tokenService.saveRefreshToken(_id, tokens.refreshToken)

    return { ...tokens }
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) throw ErrorApi.BadRequest(`Пользователь с адресом ${email} не найден`)

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) throw ErrorApi.BadRequest(`Неверный пароль`)

    const { _id, name, roles, chatID, avatar } = user
    roomService.addUser(_id.toString())
    const tokens = tokenService.generateTokens({ id: _id, email, name, roles, chatID, avatar })
    console.log(tokens)
    await tokenService.saveRefreshToken(_id, tokens.refreshToken)

    return { ...tokens }
  }

  async logout(refreshToken) {
    const { id } = tokenService.validateRefreshToken(refreshToken)
    roomService.deleteUser(id)
    const token = tokenService.clearToken(refreshToken)
    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw ErrorApi.UnathorizedError()
    const userData = tokenService.validateRefreshToken(refreshToken) // проверяем валидность refresh token
    const tokenData = await tokenService.getToken(refreshToken) // проверяем этот token в БД
    if (!userData || !tokenData) throw ErrorApi.UnathorizedError()
    const user = await UserModel.findById(userData.id)

    const { _id, email, name, roles, chatID, avatar } = user
    const tokens = tokenService.generateTokens({ id: _id, email, name, roles, chatID, avatar })
    await tokenService.saveRefreshToken(_id, tokens.refreshToken)
    return { ...tokens }
  }

  async getAll() {
    const users = await UserModel.find()
    return users
  }

  async getOnline() {
    let onlineUsers = await roomService.getOnlineUsers()
    return onlineUsers
  }

  async changeName(user, newName) {
    const email = user.email
    const { _id, name, roles, chatID, avatar } = await UserModel.findOneAndUpdate({ email }, { name: newName }, { new: true })
    await MessageModel.updateMany({ userID: chatID }, { userName: name })
    const tokens = tokenService.generateTokens({ id: _id, email, name, roles, chatID, avatar })
    await tokenService.saveRefreshToken(_id, tokens.refreshToken)
    return { ...tokens }
  }
}

module.exports = new UserService()
