

function Paint (config) {
  
  this._mouseDownPoint = null
  this._type = config.type || 'polygon'
  this._tempPolygon = null
  this._tempPositions = null
  
  
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
  }
}

Paint.prototype.handleMouseUp = function (evt) {
  
}

Paint.prototype.setMap = function(map) {
  this.map = map
}

Paint.prototype.draw = function(map) {


}




