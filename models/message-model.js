const { Schema, model } = require('mongoose')

const MessageSchema = Schema({
  userID: Number,
  userName: String,
  userAvatar: String,
  sendTime: Date,
  text: String,
  room: String
})

module.exports = model('Message', MessageSchema)
