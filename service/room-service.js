const MessageModel = require('../models/message-model')
const UserModel = require('../models/user-model')

class Room {
  constructor({ _id, title, isPrivate, avatar }) {
    this.id = _id.toString()
    this.title = title
    this.privateRoom = isPrivate
    this.avatar = avatar
    this.users = new Set()
    this.history = []
    this.onlineUsers = []
  }

  async addMessage(msgData) {
    const messageModel = await new MessageModel(msgData).save()
    return await setupMessage(messageModel)
  }

  addUser(userID) {
    this.users.add(userID)
  }

  deleteUser(userID) {
    this.users.delete(userID)
    this.onlineUsers = this.onlineUsers.filter(user => user.id !== userID)
  }

  async loadHistory() {
    let msgs = await MessageModel.find({ roomID: this.id })
    return await Promise.all(msgs.map(async msg => await setupMessage(msg)))
  }

  async getOnlineUsers() {
    let onlineUsers = await UserModel.find({ _id: { $in: [...this.users] } })
    this.onlineUsers = onlineUsers.map(user => {
      const u = { id: user._id.toString(), ...user._doc }
      delete u._id
      delete u.__v
      return u
    })
  }

  isUserInRoom(id) {
    return this.users.has(id)
  }

  updateUser() {
    return this.users
  }
}

module.exports = Room

async function setupMessage({ userID, roomID, sendTime, text }) {
  const { name, avatar } = await UserModel.findById(userID)
  return { userID, roomID, userName: name, userAvatar: avatar, sendTime, text }
}
