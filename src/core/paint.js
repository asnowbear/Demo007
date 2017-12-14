

function Paint (config) {
  this.map = null
  this._mouseDownPoint = null
  this._type = config.type || 'polygon'
  this._tempPolygon = null
  this._tempPositions = null
  this._tempLinePositions = null
  this._killCoordinates = null
  
  
}

Paint.prototype.handleEvent = function (evt) {
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
  }
  
}

Paint.prototype.handleMouseDown = function (evt) {
  this._mouseDownPoint = [evt.mapX, evt.mapY]
}

Paint.prototype.handleMouseMove = function (evt) {
  var point = [evt.mapX, evt.mapY]
  
  if (this._tempPolygon === null) {
    this._tempPolygon = new MyPolygon()
    this._tempPolygon.setPosition([point])
  } else {
    this.updateDrawing(point)
  }
}

Paint.prototype.updateDrawing = function (point) {

}

Paint.prototype.handleMouseUp = function (evt) {
  var downPt = this._mouseDownPoint
  var clickPt = [evt.mapX, evt.mapY]

  var dx = downPt[0] - clickPt[0],
      dy = downPt[1] - clickPt[1]

  var dist = dx * dx + dy * dy

  if (dist <= 36) {
    if (!this._killCoordinates) {
      this._doDrawing(evt)
    }
    // else if (this._atFinish(evt)) {
    //   if (this._finishCondition(evt)) {
    //     this._finishDrawing()
    //   }
    // }
    else {
      this._continuesToDrawing(evt)
    }
  }
}

Paint.prototype._continuesToDrawing = function(evt) {
  var pt = [evt.mapX, evt.mapY]

  var coordinates = this._tempPositions
  coordinates.push(pt.slice())

  this._killCoordinate = coordinates[0]

  this._tempPolygon.setPosition(this._tempPositions)
  this.map.refresh()
}

Paint.prototype._doDrawing = function(evt) {
  var pt = [evt.mapX, evt.mapY]
  this._killCoordinates = pt

  this._tempPositions = [pt.slice(), pt.slice()]

  var polygon = new MyPolygon()
  polygon.tag = 'temp'
  polygon.setPosition(this._tempPositions)
  this._tempPolygon = polygon

  this.map.datasource.push(this._tempPolygon)
  this.map.refresh()
}

Paint.prototype.setMap = function(map) {
  this.map = map
}

Paint.prototype.draw = function(map) {
  var datasource = map.datasource
  var map = this.map

  datasource.forEach(function(geo){
    geo.draw(map.context)
  })
}




