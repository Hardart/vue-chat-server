const ns = require('../service//namespace-service')
const MessageModel = require('../models/message-model')
const { Server } = require('socket.io')
const Room = require('../service/room-service')

/** @param {Server} io */
module.exports = io => {
  io.on('connection', socket => {
    socket.emit('nsList', ns)
  })
  io.of(ns.endpoint).on('connection', nsSocket => {
    // nsSocket.on('disconnecting', () => {})

    nsSocket.on('room:join', async (roomToJoin, roomToLeave, userID) => {
      leaveOldRoom(nsSocket, roomToJoin, roomToLeave, userID)
      joinToNewRoom(nsSocket, roomToJoin, userID)
    })

    nsSocket.on('room:newMessage', async msgData => {
      const currentRoom = ns.rooms.find(room => room.title == msgData.room)
      const message = await currentRoom.addMessage(msgData)
      nsSocket.broadcast.emit('room:sendMessage', message)
    })
  })
  // io.of(ns.title).on('connection', async(newRoom, oldRoom) => {
  //
  //
  //   socket.emit('messageHistory', await roomService.loadHistory())
  //
  //   socket.on('logout', async () => {
  //     socket.leave(roomService.title)
  //     io.emit('clients-disconnect', await roomService.getOnlineUsers())
  //   })
  //   socket.on('disconnect', async () => {
  //     socket.leave(roomService.title)
  //     socket.broadcast.emit('clients-disconnect', await roomService.getOnlineUsers())
  //   })
  //   socket.on('newMessage', async data => {
  //     const message = await roomService.addMessage(data)
  //     io.emit('sendMessage', message)
  //   })
  //   // очищаем коллекцию Mongo
  //   socket.on('clearHistory', () => {
  //     MessageModel.deleteMany({}, async (err, res) => {
  //       if (err) return console.log(err)
  //       console.log(res)
  //       io.emit('messageHistory', [])
  //     })
  //   })
  //   socket.on('getAllMessages', async () => {
  //     socket.emit('messageHistory', await roomService.loadHistory())
  //   })
  //   socket.on('update', async () => {
  //     const messages = await roomService.loadHistory()
  //     const users = await roomService.getOnlineUsers()
  //     socket.emit('updated', { messages, users })
  //   })
  // })

  function updateUsersInRoom(roomTitle, users) {
    // Send back the number of users in this room to ALL sockets connected to this room
    io.of(ns.endpoint).to(roomTitle).emit('updateUsersInRoom', users)
  }

  async function joinToNewRoom(nsSocket, roomToJoin, userID) {
    /** @type {Room} */
    const currentRoom = ns.rooms.find(room => room.title == roomToJoin)
    nsSocket.join(roomToJoin)
    currentRoom.addUser(userID)
    await currentRoom.getOnlineUsers()
    updateUsersInRoom(roomToJoin, currentRoom.onlineUsers)

    await currentRoom.loadHistory()
    nsSocket.emit('room:messages-history', currentRoom.history)
  }

  function leaveOldRoom(nsSocket, roomToJoin, roomToLeave, userID) {
    if (roomToLeave == null || roomToJoin == roomToLeave) return
    nsSocket.leave(roomToLeave)
    /** @type {Room} */
    const oldRoom = ns.rooms.find(room => room.title == roomToLeave)
    oldRoom.deleteUser(userID)
    updateUsersInRoom(roomToLeave, oldRoom.onlineUsers)
  }
}
