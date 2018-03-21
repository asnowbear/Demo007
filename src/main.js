
var currentSelectedGeo = null,// 当前点击选中的图形
    workMap = null,
    dataCollection = null,
    paint = null,
    nav = null,
    data = null

/**
 * 初始化地图引擎
 *
 * @param url 底图图片的路径
 * @param datasource 初始数据源，如果没有，则null
 * @param allGeoDisplay 所用图形是否显示
 */
function init (url, datasource, allGeoDisplay) {
  
  resizeCanvas()
  
  /**
   * 初始引擎
   * @type {WrokMap}
   */
  workMap = new WrokMap({
    mapId: 'workMap'
  })
  
  dataCollection = {
    name: 'dataCollection',
    geos : []
  }
  
  if (datasource) {
    if (allGeoDisplay === undefined) {
      allGeoDisplay = true
    }
    
    fillData(dataCollection, datasource, allGeoDisplay)
  }
  
  workMap.datasource.push(dataCollection)
  
  /**
   * 图像底图
   * @type {MyImage}
   */
  var image = new MyImage(url)
  
  /**
   * 绘制工具
   * @type {Paint}
   */
  paint = new Paint({
    dataCollection: dataCollection,
    onDrawEnd: function(){
      alert('操作完成')
    }
  })
  paint.active = true
  
  /**
   * 底图放大、缩小、拖动工具
   * @type {Nav}
   */
  nav = new Nav()
  nav.active = true
  
  workMap.addTools([nav, image, paint])
  
  /**
   * 数据处理工具
   * @type {Data}
   */
  data = new Data()
}

function fillData (collection, datasource, allDisplay) {
  var fs = datasource.features
  if (fs) {
    fs.forEach(function(f){
      var geo = new MyPolygon()
      geo.setPosition(f.geometry.coordinates)
      geo.display = allDisplay
      collection.geos.push(geo)
    })
  }
}

/**
 * 点击后生成json格式数据
 */
$('#saveBtn').click(function(e){
  var geos = dataCollection.geos
  var resultJson = data.serialize(geos)
  var resultStr = JSON.stringify(resultJson)
  console.log(resultStr)
})

/**
 * 点击编辑按钮，找到图形，并高亮，等待delete删除
 */
$("#editBtn").click(function(e){
  // 关闭绘制工具
  paint.active = false
  
  // 监听点击，并寻找与点碰撞的图形
  var mapDom = workMap.mapDom
  $(mapDom).mousedown(function(e){
    workMap.flushLightedGeo()
    currentSelectedGeo = null
    
    var mapEvent = workMap.coordinateMapping(e)
    var findGeo = workMap.findPolygonByClickPoint([mapEvent.mapX, mapEvent.mapY])
    
    // 高亮显示
    if (findGeo) {
      findGeo.light = true
      currentSelectedGeo = findGeo
    }
    
    workMap.refresh()
  })
})

$(window).keyup(function(evt) {
  var keyCode = evt.keyCode
  // delete删除键
  if (keyCode === 46) {
    if (currentSelectedGeo) {
      workMap.deletePolygonById(currentSelectedGeo.id)
      workMap.refresh()
  
      paint.onDrawEnd()
      
    }
  }
  
  evt.preventDefault()
  
})

function resizeCanvas() {
  var width = $(window).get(0).innerWidth - 50,
    height = $(window).get(0).innerHeight - 100
  
  // $("#workMap").css({"width":width + 'px',"height" : height + "px"})
  $("#can").attr("width", width)
  $("#can").attr("height", height)
}



