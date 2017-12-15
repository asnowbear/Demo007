

function Paint (config) {
  config = config ? config : {}
  this.map = null
  this._mouseDownPoint = null
  this._type = config.type || 'polygon'
  this.dataCollection = config.dataCollection
  this._tempPolygon = null
  this._tempPositions = null
  // this._tempLinePositions = null
  this._killCoordinate = null
  
  this._tempDatasource = {
    name: 'tempCollection',
    geos: []
  }
  
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
  if (this._killCoordinate) {
    this.updateDrawing(evt)
  }
}

Paint.prototype.updateDrawing = function (evt) {
  var pt = [evt.mapX, evt.mapY]
  
  var coordinates = this._tempPositions
  var last = coordinates[coordinates.length - 1]
  
  last[0] = pt[0]
  last[1] = pt[1]
  
  this._tempPolygon.setPosition(coordinates)
  this.map.refresh()
}


Paint.prototype.handleMouseUp = function (evt) {
  if (this._type === null) {
    return
  }
  
  var downPt = this._mouseDownPoint
  var clickPt = [evt.mapX, evt.mapY]

  var dx = downPt[0] - clickPt[0],
      dy = downPt[1] - clickPt[1]

  var dist = dx * dx + dy * dy

  if (dist <= 36) {
    if (!this._killCoordinate) {
      this._doDrawing(evt)
    }
    else if (this._shouldStopDrawing(evt)) {
      this._stopDrawing()
    }
    else {
      this._continuesToDrawing(evt)
    }
  }
}

Paint.prototype._shouldStopDrawing = function(evt) {
  var stop = false
  if (this._tempPolygon) {
    var potentiallyDone = this._tempPositions.length > 2
    var potentiallyFinishCoordinates = [this._tempPositions[0], this._tempPositions[this._tempPositions.length - 2]]
    
    if (potentiallyDone) {
      // var map = this.map
      for (var  i = 0, ii = potentiallyFinishCoordinates.length; i < ii; i++) {
        var lastPt = potentiallyFinishCoordinates[i]
        
        // const finishPixel = map.getPixelFromCoordinate(finishCoordinate)
        
        const pixel = [evt.mapX, evt.mapY]
        const dx = pixel[0] - lastPt[0]
        const dy = pixel[1] - lastPt[1]
        const snapTolerance = 20
        stop = Math.sqrt(dx * dx + dy * dy) <= snapTolerance
        
        if (stop) {
          this._killCoordinate = lastPt
          break
        }
      }
    }
  }
  
  return stop
}

Paint.prototype._stopDrawing = function() {
  this._killCoordinate = null
  this._tempDatasource = []
  
  var tempPositions = this._tempPositions
  tempPositions.pop()
  tempPositions.push(tempPositions[0])
  this._tempPolygon.setPosition(tempPositions)
  
  this.dataCollection.geos.push(this._tempPolygon)
  this.map.refresh()
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
  this._killCoordinate = pt

  this._tempPositions = [pt.slice(), pt.slice()]

  var polygon = new MyPolygon()
  polygon.tag = 'temp'
  polygon.setPosition(this._tempPositions)
  this._tempPolygon = polygon
  this._tempDatasource.geos.push(this._tempPolygon)

  this.map.refresh()
}

Paint.prototype.setMap = function(map) {
  this.map = map
  map.datasource.push(this._tempDatasource)
}

Paint.prototype.draw = function() {
  var map = this.map
  var datasource = map.datasource
  var map = this.map

  datasource.forEach(function(collection){
    collection.geos.forEach(function(geo){
      geo.draw(map.context)
    })
  })
}




