

function MyImage (url) {
  
  this._map = null
  this.context = null


  var img = new Image()
  img.src = url

  this.loaded = false

  img.onload = (function () {
    this.loaded = true
    this.draw()
  }).bind(this)

  this.image = img
}

MyImage.prototype.setMap = function (map) {
  this._map = map
  this.context = map.context
}


MyImage.prototype.draw = function (config) {

  if (!this.loaded) {
    return
  }
  
  var image = this.image
  var context = this.context
  
  context.width = context.width

  var rate = 1
  var dx = 0 //|| imageTransform[4]
  var dy = 0 //|| imageTransform[5]
  var dw = image.width * rate // * imageTransform[0]
  var dh = image.height * rate // * imageTransform[3]

  context.drawImage(image, 0, 0, image.width, image.height, dx, dy, dw, dh)
  
  console.log('context.drawImage的参数：' +'0, 0, ' + image.width + ',' + image.height + ',' + dx + ',' + dy + ',' + dw + ',' + dh)
}