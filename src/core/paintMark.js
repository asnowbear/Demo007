/**
 *
 * @constructor
 */
function PaintMark (onPaintEnd) {
  this.mark = null
  this.marks = []
  this.active = true
  this.isCtrlDown = false
  this.onPaintEndFn = onPaintEnd === undefined ? function () {} : onPaintEnd

  var me = this
  $(window).keyup(function(evt) {
    var keyCode = evt.keyCode
    if (keyCode === 17) {
      me.isCtrlDown = false
    }
    evt.preventDefault()
  })

  $(window).keydown(function(evt) {
    var keyCode = evt.keyCode
    if (keyCode === 17) {
      me.isCtrlDown = true
    }
    evt.preventDefault()
  })
}

// PaintMark.prototype.handleEvent = function (evt) {
//   if (!this.active) {
//     return
//   }
//
//   var ok = true
//   var type = evt.type
//   switch (type) {
//     case EventTag.mouseUp:
//       this.onMouseup(evt)
//       break
//   }
//
//   return ok
// }

PaintMark.prototype.onMouseup = function (e) {
  if (!this.active) {
    return
  }

  if (!this.isCtrlDown) {
    return
  }

  var evt = this.map.coordinateMapping(e)
  var mark = {
    x: evt.mapX,
    y: evt.mapY,
    radius: 10
  }

  if( this.delIfInsertExsitMk(mark) ){
    this.map.refresh()
    return
  }

  this.marks.push(mark)
  this.mark = mark
  this.onPaintEndFn(mark)
  
  this.map.refresh()
}

PaintMark.prototype.draw = function () {
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

  var container = map.mapDom

  var me = this
  $(container).mouseup(function(e){
    me.onMouseup(e)
  })
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

PaintMark.prototype.delIfInsertExsitMk = function (p) {
  var mks = this.marks

  var del = -1
  for (var i = 0;i < mks.length ; i ++) {
    if (PaintMark.insertPoint(mks[i], p)) {
      del = i
      break
    }
  }

  if (del > -1) {
    this.marks.splice(del, 1)
    return true
  }

  return false
}

PaintMark.insertPoint = function (p1, p2) {
  var d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  if (d <= 7) {
    return true
  }

  return false
}
