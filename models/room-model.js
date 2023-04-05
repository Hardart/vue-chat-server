const { Schema, model } = require('mongoose')

const RoomSchema = Schema({
  title: String,
  isPrivate: { type: Boolean, default: false },
  avatar: String
})

module.exports = model('Room', RoomSchema)
