const convert = require('heic-convert')
const { promisify } = require('util')
const fs = require('fs')

async function heicToPng(file) {
  const [fileName, ext] = file.filename.split('.')
  if (ext !== 'heic') return file
  const fileData = {
    path: `public/img/avatars/${fileName}.png`,
    filename: `${fileName}.png`,
  }
  const inputBuffer = await promisify(fs.readFile)(file.path)
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'PNG', // output format
  })
  await promisify(fs.writeFile)(file.destination + `/${fileData.filename}`, outputBuffer)
  fs.unlink(`./${file.path}`, function (err) {
    if (err) return console.log(err)
  })
  return fileData
}

module.exports = async function (req, res, next) {
  req.file = await heicToPng(req.file)

  next()
}
