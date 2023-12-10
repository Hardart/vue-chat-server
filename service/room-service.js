const { default: mongoose } = require('mongoose')
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
    this.active = false
  }

  async addMessage(msgData) {
    const { _id } = await new MessageModel(msgData).save()
    const [message] = await MessageModel.aggregate(this.aggregateOptions('_id', _id))
    return cleanMessage(message)
  }

  addUser(userID) {
    this.users.add(userID)
  }

  deleteUser(userID) {
    this.users.delete(userID)
    this.onlineUsers = this.onlineUsers.filter(user => user.id !== userID)
  }

  async loadHistory() {
    const msgs = await MessageModel.aggregate(this.aggregateOptions('roomID', this.id))
    return msgs.map(cleanMessage)
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

  aggregateOptions(key, id) {
    return [
      {
        $match: {
          [key]: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'sender'
        }
      }
    ]
  }

  selected(select = true) {
    this.active = select ? true : false
  }
}

module.exports = Room

function cleanMessage({ _id, sendTime, text, sender: [userData] }) {
  const { name, avatar } = userData
  return { id: _id.toString(), userName: name, avatar, sendTime, text }
}
