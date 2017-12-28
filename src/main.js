
var url = 'asset/dunk.jpg'

resizeCanvas()

/**
 * 当前点击选中的图形
 * @type {null}
 */
var currentSelectedGeo = null

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

// 用于数据序列化和反序列化
var data = new Data()



