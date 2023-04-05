const ns = require('../service//namespace-service')
const MessageModel = require('../models/message-model')
const { Server } = require('socket.io')
const Room = require('../service/room-service')
const RoomModel = require('../models/room-model')

/** @param {Server} io */
module.exports = async io => {
  const rooms = await RoomModel.find()
  rooms.forEach(room => ns.addRoom(new Room(room)))

  io.on('connection', async socket => {
    socket.emit('nsList', ns)
  })

  io.of(ns.endpoint).on('connection', nsSocket => {
    nsSocket.on('room:join', onJoinRoom(nsSocket))

    nsSocket.on('room:newMessage', onNewMessage)

    nsSocket.on('disconnecting', onDisconnecting(nsSocket))
  })

  function onDisconnecting(socket) {
    return () => {
      const userID = socket.handshake.auth.id
      for (const roomTitle of socket.rooms) {
        if (roomTitle !== socket.id) {
          /** @type {Room} */
          const currentRoom = ns.findRoom(roomTitle)
          currentRoom.deleteUser(userID)

          setTimeout(() => {
            if (currentRoom.isUserInRoom(userID)) return
            socket.leave(roomTitle)
            updateUsersInRoom(roomTitle, currentRoom.onlineUsers)
          }, 3000)
        }
      }
    }
  }

  function onJoinRoom(nsSocket) {
    return async (userData, roomToLeave) => {
      leaveOldRoom(nsSocket, userData, roomToLeave)
      joinToNewRoom(nsSocket, userData)
    }
  }

  async function onNewMessage(msgData) {
    /** @type {Room} */
    const currentRoom = ns.findRoom(msgData.roomID)
    const message = await currentRoom.addMessage(msgData)
    io.of(ns.endpoint).emit('room:sendMessage', message)
  }

  function updateUsersInRoom(roomTitle, users) {
    // Send back the array of users in this room to ALL sockets connected to this room
    io.of(ns.endpoint).to(roomTitle).emit('updateUsersInRoom', users)
  }

  async function joinToNewRoom(nsSocket, userData) {
    const { activeRoom, id } = userData
    /** @type {Room} */
    const currentRoom = ns.findRoom(activeRoom)
    nsSocket.join(activeRoom)
    currentRoom.addUser(id)
    await currentRoom.getOnlineUsers()

    updateUsersInRoom(activeRoom, currentRoom.onlineUsers)

    const msgHistory = await currentRoom.loadHistory()
    nsSocket.emit('room:messages-history', msgHistory)
  }

  function leaveOldRoom(nsSocket, userData, roomToLeave) {
    const { activeRoom, id } = userData
    if (roomToLeave == null || activeRoom == roomToLeave) return
    nsSocket.leave(roomToLeave)
    /** @type {Room} */
    const oldRoom = ns.findRoom(roomToLeave)
    oldRoom.deleteUser(id)
    updateUsersInRoom(roomToLeave, oldRoom.onlineUsers)
  }
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
}
