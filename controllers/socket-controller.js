const roomService = require('../service/room-service')
const MessageModel = require('../models/message-model')

module.exports = io => {
  io.on('connection', async socket => {
    socket.join(roomService.title)

    io.emit('users-online', await roomService.getOnlineUsers())

    socket.on('enter', async () => {
      io.emit('users-online', await roomService.getOnlineUsers())
    })

    socket.on('logout', async () => {
      socket.leave(roomService.title)
      io.emit('clients-disconnect', await roomService.getOnlineUsers())
    })

    socket.on('disconnect', async () => {
      socket.leave(roomService.title)
      socket.broadcast.emit('clients-disconnect', await roomService.getOnlineUsers())
    })

    socket.on('newMessage', async data => {
      const message = await roomService.addMessage(data)
      io.emit('sendMessage', message)
    })

    // очищаем коллекцию Mongo
    socket.on('clearHistory', () => {
      MessageModel.deleteMany({}, async (err, res) => {
        if (err) return console.log(err)
        console.log(res)
        io.emit('messageHistory', [])
      })
    })

    socket.emit('messageHistory', await roomService.loadHistory())

    socket.on('getAllMessages', async () => {
      socket.emit('messageHistory', await roomService.loadHistory())
    })
  })
}
