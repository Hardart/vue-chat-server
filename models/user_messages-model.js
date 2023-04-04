const { Schema, model } = require('mongoose')

const UnreadMessageSchema = Schema({
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  read: { type: Boolean, default: false, required: true }
})

const UserMessageSchema = Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  unread: [UnreadMessageSchema]
})

module.exports = model('UserMessage', UserMessageSchema)
