const jimp = require('jimp')

function imageUpdateSize(path, width=300, height=300) {
  jimp
    .read(path)
    .then(img => {
      img
      .cover(width, height)
      .write(path)
    })
}

module.exports.imageUpdateSize = imageUpdateSize