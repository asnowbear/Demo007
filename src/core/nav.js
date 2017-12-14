
function Nav () {
  
  this._factor = 0
  this._anchor = null
  
  this.map = null
  this._mouseDownPoint = null
  
}

Nav.prototype.handleEvent = function (evt) {
  var type = evt.type
  switch (type) {
    case EventTag.mouseDown:
      this.handleMouseDown(evt)
      break
    case EventTag.mouseMove:
      this.handleMouseMove(evt)
      break
    case EventTag.mouseUp:
      this.handleMouseUp(evt)
      break
    case EventTag.mouseWheel:
    case EventTag.wheel:
      this.handleMouseWheel(evt)
      break
  }
  
}


Nav.prototype.handleMouseWheel = function(evt) {
  var type = evt.type
  var wheelEvent = evt.oldEvent
  wheelEvent.preventDefault()
  
  var anchor = [evt.mapX, evt.mapY]
  
  var map = this.map
  
  var delta = 0
  if (type == EventTag.wheel) {
    delta = wheelEvent.deltaY
  } else if (type == EventTag.mouseWheel) {
    delta = - wheelEvent.wheelDeltaY
  }
  
  if (delta === 0) {
    return
  }

  var currentLev = map.getLevel(map.level)
  var currentCenter = map.center
  var newLev

  // 放大为正
  if (delta > 0) {
    map.setLevel(-1)
  }
  // 缩小为负
  else {
    map.setLevel(1)
  }
  
  newLev = map.getLevel(map.level)

  var x = anchor[0] - newLev * (anchor[0] - currentCenter[0]) / currentLev
  var y = anchor[1] - newLev * (anchor[1] - currentCenter[1]) / currentLev
  
  map.center = [x, y]
  map.refresh()

  this._factor += delta
  this._factor = 0
}

Nav.prototype.handleMouseDown = function(evt) {
  this._mouseDownPoint = [evt.mapX, evt.mapY]
  
  
}

Nav.prototype.handleMouseMove = function(evt) {
  if (!this._mouseDownPoint) {
    return
  }
  
  var mouseMovePoint = [evt.mapX, evt.mapY]
  var lastMouseDownPoint = this._mouseDownPoint
  var map = this.map
  var center = map.center
  
  var dx = mouseMovePoint[0] - lastMouseDownPoint[0],
      dy = mouseMovePoint[1] - lastMouseDownPoint[1]
  
  map.center = [center[0] +　dx, center[1] + dy]
  map.refresh()
  
  this._mouseDownPoint = mouseMovePoint
}

Nav.prototype.handleMouseUp = function(evt) {
  this._mouseDownPoint = null
}


Nav.prototype.setMap = function (map) {
  this.map = map
}