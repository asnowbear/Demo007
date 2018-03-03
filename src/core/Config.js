/**
 *
 * @type {{}}
 */
var Config = {}

Config.style = {
  fillStyle: 'rgba(255, 0, 0, 0.1)',
  strokeStyle: {
    color: 'rgba(255, 0, 0, 1)',
    width: 2
  }
}

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}


var M = {};

function canvasApi(mapId, id) {
  
  var currentSelectedGeo = undefined,// 当前点击选中的图形
    // workMap = undefined,
    dataCollection = undefined,
    paint = undefined,
    nav = undefined,
    // paintMark = undefined
    data = undefined
  
  
  return {
    getError: function () {
      return (M[id] || {}).error || '';
    },// 获取最后的错误信息字符串，如果无返回'';
    init: function (width, height) {
      M[id] = {};
      
      // 设置画布实际尺寸
      $("#"+mapId+"").css({"width":width + 'px',"height" : height + "px"})
      $("#"+id+"").attr("width", width)
      $("#"+id+"").attr("height", height)
      
      // 初始引擎
      workMap = new WrokMap({
        mapId: mapId,
        canvasId: id
      })
      
      dataCollection = {
        name: 'dataCollection',
        geos : []
      }
      
      // 缩放工具
      nav = new Nav()
      nav.active = true
      
      workMap.addTools([nav])
      
      // 数据处理工具
      data = new Data()
      
    },// 初始化，考虑你需要大小我给大小来初始化，成功返回true，否则返回false
    setTeachPaint: function () {
      paint = new Paint({
        dataCollection: dataCollection
      })
      paint.active = true
      
      workMap.addTools([paint])
      
    },// 为老师绘制初始，成功返回true，否则返回false
    setStudentPaint: function () {
      paintMark = new PaintMark(function () {
        var len = dataCollection.geos.length
        var pointMarkLen = paintMark.marks.length
        if (pointMarkLen >= len) {
          paintMark.active = false
        }
      })
      
      workMap.addTools([paintMark])
      return true
    },// 为学生绘制初始，成功返回true，否则返回false
    setImg: function (src) {
      var image = new MyImage(src)
      workMap.addTools([image])
      return true
    },// 设置画布的图片；，成功返回true，否则返回false
    getTeachPaintAreaCount: function () {
      if (dataCollection) {
        if(dataCollection.geos) {
          return dataCollection.geos.length
        }
      }
      
      return false
    },// 拿到老师绘制不相连的区域个数，成功返回不小于0数字，否则返回false
    getTeachPaintString: function () {
      if (dataCollection) {
        if (dataCollection.geos) {
          var geos = dataCollection.geos
          var resultJson = data.serialize(geos)
          var resultStr = JSON.stringify(resultJson)
          return resultStr
        }
      }
      
      return ''
    },// 拿到老师绘制数据字符串，只存为显现时用，若未绘制返回''
    setTeachPaintString: function (dataStr) {
      if (dataStr === '' || dataStr === undefined) {
        return false
      }
      
      var datasource = JSON.parse(dataStr)
      
      var fillData = function (collection, datasource, allDisplay) {
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
      
      fillData(dataCollection, datasource, true)
      
      workMap.datasource.push(dataCollection)
      return true
    },// 把获取到的老师绘制数据字符串原样传过去，要显现出来，成功返回true，否则返回false
    disablePaint: function () {
      if (paintMark) {
        paintMark.active = false
      }
      
      if (paint) {
        paint.active = false
      }
      
      return true
    },// 不管是学生还是老师绘制模式，禁止绘制，只可看，成功返回true，否则返回false
    getStudentPaintString: function () {
      if (!paintMark) {
        return  ''
      }
      
      var marks = paintMark.marks
      return JSON.stringify(marks)
    },// 拿到学生绘制数据字符串，只存为显现时用，若未绘制返回''
    setStudentPaintString: function (dataStr) {
      if (dataStr === '' || dataStr === undefined) {
        return false
      }
      
      if (!paintMark) {
        return false
      }
      
      var data = JSON.parse(dataStr)
      paintMark.marks = data
      
    },// 把获取到的学生绘制数据字符串原样传过去，要显现出来;，成功返回true，否则返回false


    getStudentOkPaints2 : function (teachPaintString) {
      if (teachPaintString === '' || teachPaintString === undefined) {
        return false
      }

      // 反序列化多边形对象集合
      var fillData = function (collection, datasource) {
        var fs = datasource.features
        if (fs) {
          fs.forEach(function(f){
            var geo = new MyPolygon()
            geo.setPosition(f.geometry.coordinates)
            collection.push(geo)
          })
        }
      }

      var coll = []
      fillData(coll, JSON.parse(teachPaintString))

      //
      var findPointInPolygon  = function (polys, mk) {
        var filts = polys.filter(function(poly) {
          return WrokMap.containsPointPolygon([mk.x, mk.y], poly.coords )
        })

        return filts
      }

      var pointsOutPyCount = 0,
          polyCountObj = {}
      var mks = paintMark.marks,
          mksLen = mks.length

      for (var i = 0 ;i < mksLen; i ++) {
        var mk = mks[i]

        var polysContainmks = findPointInPolygon(coll, mk)
        var l = polysContainmks.length
        // 在外部
        if (l === 0) {
          pointsOutPyCount ++
        } else {
          // 在内部，需要排除2个点位于一个多边形内的情况（只算一个）
          if (l === 1) {
            var kob = polysContainmks[0]
            if (!polyCountObj.hasOwnProperty(kob.id)) {
              polyCountObj[kob.id] = 1
            }
          }
          // 内嵌的情况(暂时没有考虑相交的情况，如存在，也不影响统计结果的正确性)
          else {

            var p1 = polysContainmks[0]
                p2 = polysContainmks[1]
            p1 = WrokMap.getInsidePolygon(p1, p2)

            if (!polyCountObj.hasOwnProperty(p1.id)) {
              polyCountObj[p1.id] = 1
            }
          }
        }
      }

      var inPyCount = Object.keys(polyCountObj).length
      var res =  inPyCount - pointsOutPyCount
      return  res > 0 ? res : 0
    },
    getStudentOkPaints: function (teachPaintString) {
      if (teachPaintString === '' || teachPaintString === undefined) {
        return false
      }
      
      // 反序列化多边形对象集合
      var fillData = function (collection, datasource) {
        var fs = datasource.features
        if (fs) {
          fs.forEach(function(f){
            var geo = new MyPolygon()
            geo.setPosition(f.geometry.coordinates)
            collection.push(geo)
          })
        }
      }
      
      var coll = []
      fillData(coll, JSON.parse(teachPaintString))
  
      // 计算有多少个点在指定多边形内的数量
      var findPointInPolygon  = function (poly, mks) {
        var filts = mks.filter(function(mk) {
          return WrokMap.containsPointPolygon([mk.x, mk.y], poly.coords )
        })
        
        return filts
      }
      
      var pyCountHasMk = 0, // 拥有点的多边形数量
          mkCountInPy = 0 // 被多边形包含的点的数据
      var mks = paintMark.marks,
          mksLen = mks.length
      
      // 遍历多边形，寻找多边形内的点
      for(var i = 0;i < coll.length ; i ++) {
        var p = coll[i]
  
        var f = findPointInPolygon(p, mks)
        if (f.length > 0) {
          mkCountInPy += f.length
          pyCountHasMk ++
        }
      }
      
      // 正确个数 = 含有点的多边形个数 - 不在多边形内的点个数
      var resultCount = pyCountHasMk - (mksLen - mkCountInPy)
      return resultCount > 0 ? resultCount : 0
      
    },// 返回学生绘制数量与老师一样，且都在区域内true或其它false
// 把学生、老师绘制数据放上去操作，需要允许在同一个画布中显现老师与学生绘制， 这种一般出现在查看答案时用到
    destroy: function () {
      currentSelectedGeo = undefined
      workMap = undefined
      dataCollection = undefined
      paint = undefined
      nav = undefined
      paintMark = undefined
      data = undefined
      
      return delete M[id];
    }//销毁回收内存，因为有重置画板的可能
    
  }
}

