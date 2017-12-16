

function MyPolygon () {
  this.coords = []
  this.feature = {}
  this.tag = ''
  
  this.fillStyle = null
  
  this.id = uuid()
}


MyPolygon.prototype.setPosition = function (values) {
  this.coords = values
}

MyPolygon.prototype.invertMartrix = function (c, offset, end, stride, T, opt_dest) {
  var dest = opt_dest ? opt_dest : []
  var i = 0, j
  
  for (j = offset; j < end; j += stride) {
    var x = c[j]
    var y = c[j + 1]
    dest[i++] = T[0] * x + T[2] * y + T[4]
    dest[i++] = T[1] * x + T[3] * y + T[5]
  }
  
  if (opt_dest && dest.length != i) {
    dest.length = i
  }
  
  return dest
}


MyPolygon.prototype.draw = function (context, map) {
  
  var oldCoords = this.coords
  var coords = []
  var invertMartrixFn = this.invertMartrix,
       martrix = map.matrix.pixel
  
  oldCoords.forEach(function(points){
    var tempPt = invertMartrixFn(points, 0, points.length, 2, martrix)
    tempPt[0] = (tempPt[0] + 0.5) | 0
    tempPt[1] = (tempPt[1] + 0.5) | 0
  
    coords.push(tempPt)
  })
  
  var config = Config.style
  context.save()
  context.beginPath()
  
  context.moveTo(coords[0][0],coords[0][1])
  for (var i = 0, len = coords.length ; i < len ; i ++){
    var pts = coords[i]
    context.lineTo(pts[0], pts[1])
  }
  
  context.closePath()

  context.fillStyle = config.fillStyle
  context.fill()

  context.strokeStyle = config.strokeStyle.color
  context.lineWidth = config.strokeStyle.width
  context.stroke()
  
  context.restore()
}