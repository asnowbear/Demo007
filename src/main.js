
var url = 'asset/dunk.jpg'

var workMap = new WrokMap({
  mapId: 'workMap',
  canvasId: 'can'
})

var image = new MyImage(url)
var paint = new Paint()
var nav = new Nav()

workMap.addTools([image, paint, nav])

workMap.refresh()