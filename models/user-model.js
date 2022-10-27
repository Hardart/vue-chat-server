require('dotenv').config()
const { Schema, model } = require('mongoose')

const UserSchema = Schema({
   chatID: Number,
   email: { type: String, required: true, unique: true },
   name: String,
   password: { type: String, required: true },
   avatar: {
      type: String,
      default: process.env.AVATAR,
      set: (a) => `${process.env.SERVER_URL}/${a}`,
   },

   roles: { type: Array, default: ['user'], required: true },
})

module.exports = model('User', UserSchema)
