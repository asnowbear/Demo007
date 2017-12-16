

function WrokMap (config) {
  var hostDom = config.mapId
  var canvasId = config.canvasId
  // this.zoomFactor = config.zoomFactor || 0.25
  this.levels = config.levels || [ 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]
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

  this.martrix = matrix
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
  
  var newE = {
    oldEvent: origE,
    type: origE.type,
    // mapX: transform[0] * x + transform[2] * y + transform[4],
    // mapY: transform[1] * x + transform[3] * y + transform[5]
    mapX: x,
    mapY: y
  }

  return newE
}