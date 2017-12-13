

function WrokMap (config) {
  var hostDom = config.mapId
  var canvasId = config.canvasId
  this.zoomFactor = config.zoomFactor || 0.25
  this.mapDom = document.getElementById(hostDom)
  this.canvasDom = document.getElementById(canvasId)
  this.canvasWidth = this.canvasDom.width
  this.canvasHeight = this.canvasDom.height
  this.context = this.canvasDom.getContext('2d')
  this.tools = []
  this.center = null
  this.level = null
  this.datasource = []
  
  this._addEventsToMap()
  
  this.level = 1
  
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


WrokMap.prototype._coordinateMapping = function (origE) {
  var mapDom = this.mapDom
  var position = mapDom.getBoundingClientRect()
  const eventPosition = origE
  var srcreePosition =  [
    eventPosition.clientX - position.left,
    eventPosition.clientY - position.top
  ]
  
  var newE = {
    oldEvent: origE,
    type: origE.type,
    mapX: srcreePosition[0],
    mapY: srcreePosition[1]
  }

  return newE
}