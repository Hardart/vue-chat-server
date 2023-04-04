const MessageModel = require('../models/message-model')
const UserModel = require('../models/user-model')

class Room {
  constructor(roomId, title, privateRoom = false) {
    this.roomId = roomId
    this.title = title
    this.privateRoom = privateRoom
    this.users = new Set()
    this.history = []
    this.onlineUsers = []
  }

  async addMessage(msgData) {
    const message = new MessageModel(msgData)
    await message.save()
    this.history.push(message)
    return message
  }

  addUser(userID) {
    this.users.add(userID)
  }

  deleteUser(userID) {
    this.users.delete(userID)
    this.onlineUsers = this.onlineUsers.filter(user => user.id !== userID)
  }

  async loadHistory() {
    this.history = await MessageModel.find({ room: this.title })
  }

  async getOnlineUsers() {
    let onlineUsers = await UserModel.find({ _id: { $in: [...this.users] } })
    this.onlineUsers = onlineUsers.map(user => ({
      id: user._id.toString(),
      chatID: user.chatID,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      roles: user.roles
    }))
  }

  updateUser() {
    return this.users
  }
}

module.exports = Room
