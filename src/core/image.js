

function Image (url) {
  
  this._map = null
  this.context = null


  var img = new Image()
  img.src = url

  this.loaded = false

  img.onload = (function () {
    this.loaded = true
  }).bind(this)

  this.image = img
}

Image.prototype.setMap = function (map) {
  this._map = map
  this.context = map.context
}


Image.prototype.draw = function (config) {

  if (!this.loaded ) {
    return
  }

  var image = this.image
  var context = this.context

  var dx = imageTransform[4]
  var dy = imageTransform[5]
  var dw = image.width * imageTransform[0]
  var dh = image.height * imageTransform[3]

  context.drawImage(image, 0, 0, +image.width, +image.height,
    Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh))
}