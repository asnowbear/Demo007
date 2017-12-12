

function WrokMap (config) {
  var hostDom = config.mapId
  var canvasId = config.canvasId
  this.mapDom = document.getElementById(hostDom)
  this.canvasDom = document.getElementById(canvasId)
  this.context = this.canvasDom.getContext('2d')
  this.tools = []
  this.datasource = []
  
  this._addEventsToMap()
  
  this.level = 1
  
}

WrokMap.prototype.refresh = function() {
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
  var newE = {
    oldEvent: origE,
    type: origE.type,
    mapX: 0,
    mapY: 0
  }

  return newE

}