require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').Server(app)
const PORT = process.env.PORT || 3000
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const router = require('./router/index')
const uploads = require('./router/uploads')
const errorMiddleware = require('./middlware/error-middleware')
const socketController = require('./controllers/socket-controller')
const io = require('socket.io')(server, {
  cors: {
    credentials: true,
    origin: process.env.CLIENT_SERVER
  }
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_SERVER
  })
)
app.use('/', router)
app.use('/upload', uploads)
app.use(errorMiddleware)

async function startServer() {
  try {
    mongoose.connect(
      process.env.DB_CONN,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      () => console.log('БД подключена\n====================================')
    )
    server.listen(PORT, () => {
      console.log(`====================================\nСервер запущен, порт: ${PORT}\n====================================`)
    })
  } catch (e) {
    console.log(e)
  }
}

startServer()
socketController(io)
