

function MyImage (url) {
  
  this._map = null
  this.context = null
  this.imageWidth = 0
  this.imageHeight = 0


  var img = new Image()
  img.src = url

  this.loaded = false

  img.onload = (function () {
    this.loaded = true
    this.imageHeight = img.height
    this.imageWidth = img.width
  
    this.draw()
  }).bind(this)

  this.image = img
}

MyImage.prototype.setMap = function (map) {
  this._map = map
  this.context = map.context
}


MyImage.prototype.draw = function () {

  if (!this.loaded) {
    return
  }
  
  var context = this.context
  // 处理
  var image = this.image
  var imageWidth = this.imageWidth
  var imageHeight = this.imageHeight
  
  var map = this._map
  var center = map.center,
      factor = map.getLevel(map.level)
  
  if (center === null) {
    center = [this.imageWidth / 2, this.imageHeight / 2]
    map.center = center
  }
  
  var dw = image.width * factor
  var dh = image.height * factor
  
  var dx = center[0] - dw / 2,
      dy = center[1] - dh / 2
  

  context.drawImage(image, 0, 0, image.width, image.height, dx, dy, dw, dh)
  
  console.log('context.drawImage的参数：' +'0, 0, ' + image.width + ',' + image.height + ',' + dx + ',' + dy + ',' + dw + ',' + dh)
}