const { Schema, model } = require('mongoose')

const MessageSchema = Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User' },
  roomID: { type: Schema.Types.ObjectId, ref: 'Room' },
  sendTime: Date,
  text: String
})

module.exports = model('Message', MessageSchema)
