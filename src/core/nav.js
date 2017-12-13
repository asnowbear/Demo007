
function Nav () {
  
  this.level = 1
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

  var currentFactor = map.zoomFactor
  var currentCenter = map.center
  var newFactor

  // 放大为正
  if (delta > 0) {
    map.level ++
    newFactor = map.zoomFactor + map.zoomFactor
  }
  // 缩小为负
  else {
    map.level --
    newFactor = map.zoomFactor - map.zoomFactor
  }


  var x = anchor[0] - newFactor * (anchor[0] - currentCenter[0]) / currentFactor
  var y = anchor[1] - newFactor * (anchor[1] - currentCenter[1]) / currentFactor

  map.center = [x, y]
  map.zoomFactor = newFactor
  map.refresh()

  this._factor += delta

  
  this._factor = 0
  // this._anchor = null
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