

function WrokMap (config) {
  var hostDom = config.mapId
  var canvasId = config.canvasId
  this.levels = config.levels || [ 2, 1, 0.5, 0.25, 0.125, 0.0625]
  this.level = config.level || 1
  this.mapDom = document.getElementById(hostDom)
  this.canvasDom = document.getElementById(canvasId)
  this.canvasWidth = this.canvasDom.width
  this.canvasHeight = this.canvasDom.height
  this.context = this.canvasDom.getContext('2d')
  this.tools = []
  this.center = null
  this.datasource = []
  this._addEventsToMap()

  this._calculateSize()
}

WrokMap.prototype._calculateSize = function () {
  var computedStyle = getComputedStyle(this.mapDom)
  this.size = [
    this.mapDom.offsetWidth -
    parseFloat(computedStyle['borderLeftWidth']) -
    parseFloat(computedStyle['paddingLeft']) -
    parseFloat(computedStyle['paddingRight']) -
    parseFloat(computedStyle['borderRightWidth']),
    this.mapDom.offsetHeight -
    parseFloat(computedStyle['borderTopWidth']) -
    parseFloat(computedStyle['paddingTop']) -
    parseFloat(computedStyle['paddingBottom']) -
    parseFloat(computedStyle['borderBottomWidth'])
  ]
}

WrokMap.prototype.setLevel = function (step) {
  var len = this.levels.length
  var level = this.level
  level = level + step
  
  if (level < 0) {
    level = 0
  } else if (level > len - 1) {
    level = len - 1
  }
  
  this.level = level
}


WrokMap.prototype.getLevel = function (level) {
  return this.levels[level]
}

WrokMap.prototype.refresh = function() {
  var context = this.context
  context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
  
  this._updateMatrix()
  
  this.tools.forEach(function(tool){
    if (tool.draw) {
      tool.draw()
    }
  })
}

WrokMap.prototype.addTools = function(tools) {
  var me = this

  tools.forEach(function(tool){
    me.tools.push(tool)
    tool.setMap(me)
  })
}

WrokMap.prototype._handleEvent = function (e) {
  var event = this._coordinateMapping(e)

  this.tools.forEach(function(tool){
    if (tool.handleEvent) {
      tool.handleEvent(event)
    }
  })
}

WrokMap.prototype._addEventsToMap = function () {
  var mapDom = this.mapDom
  var handleEventFn = this._handleEvent.bind(this)
  
  for (var key in EventTag) {
    mapDom.addEventListener(EventTag[key], handleEventFn)
  }
}

WrokMap.prototype._updateMatrix = function () {
  if (!this.center) {
    return
  }
  
  var center = this.center,
      lev = this.getLevel(this.level),
      size = this.size

  var dx1 =  size[0] / 2,
      dy1 =  size[1] / 2,
      sx = 1 / lev,
      sy = sx,
      angle = 0,
      dx2 = -center[0],
      dy2 = -center[1]

  var sin = Math.sin(angle)
  var cos = Math.cos(angle)

  var matrix = [0, 0, 0, 0, 0, 0]

  matrix[0] = sx * cos
  matrix[1] = sy * sin
  matrix[2] = -sx * sin
  matrix[3] = sy * cos
  matrix[4] = dx2 * sx * cos - dy2 * sx * sin + dx1
  matrix[5] = dx2 * sy * sin + dy2 * sy * cos + dy1
  
  var matrix2 = [0, 0, 0, 0, 0, 0]
  matrix2[0] = matrix[0]
  matrix2[1] = matrix[1]
  matrix2[2] = matrix[2]
  matrix2[3] = matrix[3]
  matrix2[4] = matrix[4]
  matrix2[5] = matrix[5]
  
  var det = matrix2[0] * matrix2[3] - matrix2[1] * matrix2[2]
  var a = matrix2[0]
  var b = matrix2[1]
  var c = matrix2[2]
  var d = matrix2[3]
  var e = matrix2[4]
  var f = matrix2[5]
  
  matrix2[0] = d / det
  matrix2[1] = -b / det
  matrix2[2] = -c / det
  matrix2[3] = a / det
  matrix2[4] = (c * f - d * e) / det
  matrix2[5] = -(a * f - b * e) / det

  this.matrix = {
    pixel: matrix,
    coordinate: matrix2
  }
}


WrokMap.prototype._coordinateMapping = function (origE) {
  var mapDom = this.mapDom
  var position = mapDom.getBoundingClientRect()
  var eventPosition = origE
  var srcreePosition =  [
    eventPosition.clientX - position.left,
    eventPosition.clientY - position.top
  ]

  var x = srcreePosition[0]
  var y = srcreePosition[1]
  
  var mt = this.matrix.coordinate
  
  var newE = {
    oldEvent: origE,
    type: origE.type,
    mapX: mt[0] * x + mt[2] * y + mt[4],
    mapY: mt[1] * x + mt[3] * y + mt[5]
  }

  return newE
}