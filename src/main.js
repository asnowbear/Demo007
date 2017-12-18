
var url = 'asset/1.png'

var workMap = new WrokMap({
  mapId: 'workMap',
  canvasId: 'can'
})

var dataCollection = {
  name: 'dataCollection',
  geos : []
}

workMap.datasource.push(dataCollection)

var image = new MyImage(url)
var paint = new Paint({
  dataCollection: dataCollection
})

var nav = new Nav()
nav.active = true

workMap.addTools([nav, image, paint])
