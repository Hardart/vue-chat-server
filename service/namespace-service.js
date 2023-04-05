const Room = require('./room-service')

class Namespace {
  constructor(id, title, img, endpoint) {
    this.id = id
    this.img = img
    this.title = title
    this.endpoint = endpoint
    this.rooms = []
    this.active = ''
  }

  addRoom(roomObj) {
    this.rooms.push(roomObj)
  }

  selectedNS(bool = true) {
    this.active = bool ? 'active' : ''
  }

  findRoom(roomID) {
    return this.rooms.find(r => r.id == roomID)
  }
}
const mainNS = new Namespace(0, 'Main', 'main.png', '/main')

module.exports = mainNS
