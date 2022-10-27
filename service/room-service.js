const MessageModel = require('../models/message-model')
const UserModel = require('../models/user-model')

class RoomService {
  constructor(roomId, title, privateRoom = false) {
    this.roomId = roomId
    this.title = title
    this.privateRoom = privateRoom
    this.users = new Set()
    this.onlineUsers = []
  }

  async addMessage({ userID, userName, text, sendTime, userAvatar }) {
    const message = new MessageModel({
      userID,
      userName,
      sendTime,
      userAvatar,
      text
    })

    await message.save()
    return message
  }

  addUser(userID) {
    this.users.add(userID)
  }

  deleteUser(userID) {
    this.users.delete(userID)
  }

  async loadHistory() {
    return await MessageModel.find()
  }

  async getOnlineUsers() {
    let onlineUsers = await UserModel.find({ _id: { $in: [...this.users] } })
    onlineUsers = onlineUsers.map(user => ({
      id: user._id.toString(),
      chatID: user.chatID,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      roles: user.roles
    }))

    return onlineUsers
  }

  updateUser() {
    return this.users
  }
}

module.exports = new RoomService(0, 'main')
