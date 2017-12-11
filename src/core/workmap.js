

function WrokMap (config) {
  var hostDom = config.mapId
  var canvasId = config.canvasId
  this.mapDom = document.getElementById(hostDom)
  this.canvasDom = document.getElementById(canvasId)
  this.context = this.canvasDom.getContext('2d')
  this.tools = []
  this.datasource = []
  
  this._addEventsToMap()
  
}

WrokMap.prototype.refresh = function() {
  this.tools.forEach(function(tool){
    tool.draw()
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

  tools.forEach(function(tool){
    tool._handleEvent()
  })
}

WrokMap.prototype._addEventsToMap = function () {
  var mapDom = this.mapDom
  var handleEventFn = this._handleEvent
  
  for (var key in EventTag) {
    mapDom.addEventListener(EventTag[key], handleEventFn)
  }
}


WrokMap.prototype._coordinateMapping = function (origE) {
  var newE = {
    oldEvent: origE,
    type: origE.type,
    mapX:
    mapY:
  }

  return newE

}