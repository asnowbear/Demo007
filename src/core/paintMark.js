/**
 *
 * @constructor
 */
function PaintMark (onPaintEnd) {
  this.mark = null
  this.marks = []
  this.active = true
  this.onPaintEndFn = onPaintEnd === undefined ? function () {} : onPaintEnd
}

PaintMark.prototype.handleEvent = function (evt) {
  if (!this.active) {
    return
  }
  
  var ok = true
  var type = evt.type
  switch (type) {
    case EventTag.mouseUp:
      this.onMouseup(evt)
      break
  }
  
  return ok
}

PaintMark.prototype.onMouseup = function (evt) {
  if (!this.active) {
    return
  }
  
  var mark = {
    x: evt.mapX,
    y: evt.mapY,
    radius: 10
  }
  
  this.marks.push(mark)
  this.mark = mark
  this.onPaintEndFn(mark)
  
  this.map.refresh()
}

PaintMark.prototype.draw = function () {
  if (!this.mark) {
    return
  }
  
  if (this.marks.length === 0) {
    return
  }
  
  var context = this.context
  var invertMartrixFn = this.invertMartrix
  context.save()
  for(var i = 0, len = this.marks.length ; i < len ; i ++) {
    var m = this.marks[i]
    var points = [m.x, m.y]
    var tempPt = invertMartrixFn(points, 0, points.length, 2, this.map.matrix.pixel)
    context.fillStyle = 'rgba(255,0,0,0.6)'
    context.fillRect(tempPt[0] - m.radius/2, tempPt[1] - m.radius/ 2, m.radius, m.radius)
  }
  
  context.restore()
}

PaintMark.prototype.setMap = function (map) {
  this.map = map
  this.context = map.context
}

PaintMark.prototype.invertMartrix = function (c, offset, end, stride, T, opt_dest) {
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