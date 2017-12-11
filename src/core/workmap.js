

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

WrokMap.prototype._handleEvent = function (e) {
  
}

WrokMap.prototype._addEventsToMap = function () {
  var mapDom = this.mapDom
  var handleEventFn = this._handleEvent
  
  for (var key in EventTag) {
    mapDom.addEventListener(key, handleEventFn)
  }
}