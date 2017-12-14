

function MyPolygon () {
  this.coords = []
  this.feature = {}
  this.tag = ''
  
  
}


MyPolygon.prototype.setPosition = function (values) {
  this.coords = values
}

MyPolygon.prototype.draw = function (context) {
  var coords = this.coords
  ctx.save()

  ctx.beginPath()

  // const coordinates = renderOpt.coordinates
  ctx.moveTo(coordinates[0][0],coordinates[0][1])

  for (var k = 0, kk = coords.length ; k < kk ; k ++){
    let cd = coordinates[k]
    ctx.lineTo(cd[0],cd[1])
  }

  if (renderOpt.fillStyle) {
    ctx.fillStyle = renderOpt.fillStyle
    ctx.fill()
  }

  ctx.closePath()

  const borderStyle = renderOpt.borderStyle
  if (borderStyle) {
    ctx.strokeStyle = colorToString(borderStyle.color,borderStyle.alpha)
    ctx.lineWidth = borderStyle.width

    if (borderStyle.lineDash) {
      ctx.setLineDash(borderStyle.lineDash)
    }

    ctx.stroke()
  }

  ctx.restore()
}