
var url = './asset/dunk.jpg'

var workMap = new WrokMap({
  mapId: 'workMap',
  canvasId: 'can'
})

var image = new Image(url)
image.setMap(workMap)