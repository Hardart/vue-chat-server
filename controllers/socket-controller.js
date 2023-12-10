const ns = require('../service//namespace-service')
const MessageModel = require('../models/message-model')
const { Server, Socket } = require('socket.io')
const Room = require('../service/room-service')
const RoomModel = require('../models/room-model')
const jwt = require('jsonwebtoken')

/** @param {Server} io */
module.exports = async io => {
  const rooms = await RoomModel.find()
  rooms.forEach(roomData => ns.addRoom(new Room(roomData)))

  io.on('connection', async socket => {
    socket.emit('nsList', ns)
  })

  io.of(ns.endpoint).on('connection', nsSocket => {
    nsSocket.on('room:join', onJoinRoom(nsSocket))

    nsSocket.on('room:newMessage', onNewMessage)

    nsSocket.on('room:keypress', onKeyPress(nsSocket))

    nsSocket.on('disconnecting', onDisconnecting(nsSocket))

    nsSocket.on('room:leave', onLeave(nsSocket))

    nsSocket.on('room:updateUsersList', onUpdateUsersInRoom)
  })

  /** @param {Socket} socket */
  function onKeyPress(socket) {
    return (isTyping, { userName, roomID }) => {
      socket.broadcast.to(roomID).emit('room:input', isTyping ? userName : null)
    }
  }

  function onDisconnecting(socket) {
    return () => {
      const user = getUserDataFromToken(socket)

      // console.log(id)
      for (const roomTitle of socket.rooms) {
        if (roomTitle == socket.id) continue
        /** @type {Room} */
        const currentRoom = ns.findRoom(roomTitle)
        currentRoom.deleteUser(user.id)

        let timerID = setTimeout(() => {
          if (currentRoom.isUserInRoom(user.id)) clearTimeout(timerID)
          socket.leave(roomTitle)
          updateUsersInRoom(roomTitle, currentRoom.onlineUsers)
        }, 3000)
      }
    }
  }

  function onLeave(socket) {
    return roomID => {
      const user = getUserDataFromToken(socket)

      const currentRoom = ns.findRoom(roomID)
      currentRoom.deleteUser(user.id)
      socket.leave(roomID)
      updateUsersInRoom(roomID, currentRoom.onlineUsers)
    }
  }

  /** @param {Socket} nsSocket */
  function onJoinRoom(nsSocket) {
    const user = getUserDataFromToken(nsSocket)

    return async (joinRoomID, leaveRoomID) => {
      //leave room
      if (leaveRoomID !== null && leaveRoomID !== joinRoomID) {
        nsSocket.leave(leaveRoomID) // leave socket from all rooms
        const roomToLeave = ns.findRoom(leaveRoomID) // find room to leave
        roomToLeave.selected(false) // deactivate room
        roomToLeave.deleteUser(user.id) // delete user from room
        updateUsersInRoom(leaveRoomID, roomToLeave.onlineUsers)
      }

      //join to room
      nsSocket.join(joinRoomID) // add socket to room
      const currentRoom = ns.findRoom(joinRoomID) // find room by ID
      currentRoom.addUser(user.id) // add user to room
      currentRoom.selected() // set room active

      await currentRoom.getOnlineUsers()
      updateUsersInRoom(joinRoomID, currentRoom.onlineUsers)

      const msgHistory = await currentRoom.loadHistory()
      nsSocket.emit('room:messages-history', msgHistory)
    }
  }

  async function onUpdateUsersInRoom(roomID) {
    const currentRoom = ns.findRoom(roomID) // find room by ID
    await currentRoom.getOnlineUsers()
    updateUsersInRoom(roomID, currentRoom.onlineUsers)
  }

  async function onNewMessage(msgData) {
    /** @type {Room} */
    const currentRoom = ns.findRoom(msgData.roomID)
    const message = await currentRoom.addMessage(msgData)
    io.of(ns.endpoint).emit('room:sendMessage', { message, roomID: currentRoom.id })
  }

  function updateUsersInRoom(roomID, users) {
    // Send back the array of users in this room to ALL sockets connected to this room
    io.of(ns.endpoint).to(roomID).emit('updateUsersInRoom', users)
  }

  function getUserDataFromToken(soket) {
    const token = soket.handshake.auth?.token
    return jwt.decode(token)
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
