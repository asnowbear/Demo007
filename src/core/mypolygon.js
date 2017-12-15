

function MyPolygon () {
  this.coords = []
  this.feature = {}
  this.tag = ''
  
  this.fillStyle = null
  
  
}


MyPolygon.prototype.setPosition = function (values) {
  this.coords = values
}

MyPolygon.prototype.draw = function (context) {
  var coords = this.coords
  var config = Config.style
  context.save()
  context.beginPath()
  
  context.moveTo(coords[0],coords[1])
  for (var i = 0, len = coords.length ; i < len ; i ++){
    var pts = coords[i]
    context.lineTo(pts[0],pts[1])
  }

  context.fillStyle = config.fillStyle
  context.fill()
  context.closePath()

  context.strokeStyle = config.strokeStyle.color
  context.lineWidth = config.strokeStyle.width
  context.stroke()
  
  context.restore()
}