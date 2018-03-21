+function (win) {
  // api
  var M = {};
  
  win.canvasApi = function (id) {
    if (M[id]) {
      // 如果已经初始化过
      return M[id];
    }
    
    var mapId = id,
      currentSelectedGeo = undefined,// 当前点击选中的图形
      workMap = undefined,
      dataCollection = undefined,
      paint = undefined,
      nav = undefined,
      paintMark = undefined,
      data = undefined;
    
    M[id] = {
      /**
       * 获取最后的错误信息字符串
       * @returns {string} 如果无返回''
       */
      getError: function () {
        return (M[id] || {}).error || '';
      },
      /**
       * 初始化，考虑你需要大小我给大小来初始化
       * @param width {int}
       * @param height {int}
       * @returns {boolean} 成功返回true，否则返回false
       */
      init: function (width, height) {
        
        // 初始引擎
        workMap = new WrokMap({
          mapId: mapId
        })
        
        dataCollection = {
          name: 'dataCollection',
          geos: []
        }
        
        workMap.datasource.push(dataCollection)
        
        // 缩放工具
        nav = new Nav()
        nav.active = true
        
        workMap.addTools([nav])
        
        // 数据处理工具
        data = new Data()
        
        return true;
      },
      /**
       * 为老师绘制初始
       * @returns {boolean} ，成功返回true，否则返回false
       */
      setTeachPaint: function () {
        paint = new Paint({
          dataCollection: dataCollection
        })
        
        paint.active = true
        workMap.addTools([paint])
        
        
        $(workMap.canvasDom).attr("title", "双击完成绘制 \n鼠标左键拖动\ndelete键删除\n")
        
        return true
      },
      /**
       * 为学生绘制初始
       * @returns {boolean} ，成功返回true，否则返回false
       */
      setStudentPaint: function (dataStr) {
        paintMark = new PaintMark(function () {
        })
        
        workMap.addTools([paintMark])
        
        $(workMap.canvasDom).attr("title", "摁住Ctrl键点击绘制\n再次点击删除\n鼠标左键拖动")
        
        return true
      },
      /**
       *  设置画布的图片；
       * @param src {string}
       * @returns {boolean} ，成功返回true，否则返回false
       */
      setImg: function (src) {
        var image = new MyImage(src)
        workMap.addTools([image])
        return true
      },
      /**
       * 拿到老师绘制不相连的区域个数
       * @returns {number} 成功返回不小于0数字，否则返回false
       */
      getTeachPaintAreaCount: function () {
        if (dataCollection) {
          if (dataCollection.geos) {
            return dataCollection.geos.length
          }
        }
        
        return false
      },
      /**
       * 拿到老师绘制数据字符串，只存为显现时用
       * @returns {string} 若未绘制返回''
       */
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
      },
      /**
       * 把获取到的老师绘制数据字符串原样传过去，要显现出来
       * @returns {boolean} 成功返回true，否则返回false
       */
      setTeachPaintString: function (dataStr) {
        if (dataStr === '' || dataStr === undefined) {
          return false
        }
        
        var datasource = JSON.parse(dataStr)
        
        var fillData = function (collection, datasource, allDisplay) {
          var fs = datasource.features
          if (fs) {
            fs.forEach(function (f) {
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
      },
      /**
       * 不管是学生还是老师绘制模式，禁止绘制，只可看
       * @returns {boolean} ，成功返回true，否则返回false
       */
      disablePaint: function () {
        if (paintMark) {
          paintMark.active = false
        }
        
        if (paint) {
          paint.active = false
        }
        
        return true
      },
      /**
       * 拿到学生绘制数据字符串，只存为显现时用
       * @returns {string} 若未绘制返回''
       */
      getStudentPaintString: function () {
        // TODO 目前功能不正确，暂问题返回定值
        if (!paintMark) {
          return ''
        }
        
        var marks = paintMark.marks
        if(marks.length === 0){
          return ''
        }
        
        return JSON.stringify(marks)
      },
      /**
       * 把获取到的学生绘制数据字符串原样传过去，要显现出来;
       * @returns {boolean} ，成功返回true，否则返回false
       */
      setStudentPaintString: function (dataStr) {
        if (dataStr === '' || dataStr === undefined) {
          return false
        }
        
        if (!paintMark) {
          return false
        }
        
        var data = JSON.parse(dataStr)
        paintMark.marks = data
        workMap.refresh()
      },
      /**
       * 返回学生绘制正确的数量
       * @param teachPaintString {string} 老师绘制的获取到数据字符串（原样不动）
       * @returns {boolean|number} 错误返回false，并设置error；否则返回正确的数量
       */
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
      onChange: function(foo) {
        if(typeof foo === 'function'){
          if(paint) {
            paint.onDrawEnd = foo
          }
          
          if(paintMark){
            paintMark.onDrawEnd = foo
          }
        }
      },
      /**
       * 销毁回收内存，因为有重置画板的可能
       * @returns {boolean}
       */
      destroy: function () {
        $("#"+mapId+"").empty()
        currentSelectedGeo = undefined
        workMap = undefined
        dataCollection = undefined
        paint = undefined
        nav = undefined
        paintMark = undefined
        data = undefined
        
        return delete M[id];
      }
      
    }
    
    return M[id];
  };
  // api
//---config.js
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

//--config.js

//--workmap.js
  /**
   *
   * @param config
   * @constructor
   */
  function WrokMap(config) {
    var hostDom = config.mapId
    this.levels = config.levels || [ 2, 1, 0.5, 0.25, 0.125, 0.0625]
    this.level = config.level || 1
    
    var vp = document.createElement('DIV')
    vp.style.position = 'relative'
    vp.style.overflow = 'hidden'
    vp.style.width = '100%'
    vp.style.height = '100%'
    this.mapDom = vp
    
    var parentDom = document.getElementById(hostDom)
    var can = document.createElement('CANVAS')
    this.canvasDom = can
    
    this.mapDom.appendChild(this.canvasDom)
    parentDom.appendChild(this.mapDom)
    
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.context = this.canvasDom.getContext('2d')
    this.tools = []
    this.center = null
    this.datasource = []
    this._addEventsToMap()
    
    this._calculateSize()
  }
  
  WrokMap.prototype.adjustImage = function (imageWidth, imageHeight) {
    
    if (imageWidth > imageHeight) {
      
    } else {
      
    }
  }
  
  WrokMap.prototype._calculateSize = function () {
    var computedStyle = getComputedStyle(this.mapDom)
    this.size = [
      this.mapDom.offsetWidth -
      parseFloat(computedStyle['borderLeftWidth']) -
      parseFloat(computedStyle['paddingLeft']) -
      parseFloat(computedStyle['paddingRight']) -
      parseFloat(computedStyle['borderRightWidth']),
      this.mapDom.offsetHeight -
      parseFloat(computedStyle['borderTopWidth']) -
      parseFloat(computedStyle['paddingTop']) -
      parseFloat(computedStyle['paddingBottom']) -
      parseFloat(computedStyle['borderBottomWidth'])
    ]
  }
  
  WrokMap.prototype.setLevel = function (step) {
    var len = this.levels.length
    var level = this.level
    level = level + step
    
    if (level < 0) {
      level = 0
    } else if (level > len - 1) {
      level = len - 1
    }
    
    this.level = level
  }
  
  
  WrokMap.prototype.getLevel = function (level) {
    return this.levels[level]
  }
  
  WrokMap.prototype.refresh = function () {
    var context = this.context
    if(this.canvasHeight !== this.canvasDom.height || this.canvasWidth === this.canvasDom.width) {
      this.canvasDom.width = this.canvasWidth
      this.canvasDom.height = this.canvasHeight
    } else {
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
    
    this._updateMatrix()
    
    this.tools.forEach(function (tool) {
      if (tool.draw) {
        tool.draw()
      }
    })
    
    this.draw()
  }
  
  WrokMap.prototype.draw = function () {
    var datasource = this.datasource
    var map = this
    
    datasource.forEach(function (collection) {
      collection.geos.forEach(function (geo) {
        geo.draw(map.context, map)
      })
    })
  }
  
  WrokMap.prototype.addTools = function (tools) {
    var me = this
    
    tools.forEach(function (tool) {
      me.tools.push(tool)
      tool.setMap(me)
    })
  }
  
  WrokMap.prototype._handleEvent = function (e) {
    var event = this.coordinateMapping(e)
    
    var ts = this.tools,
      len = ts.length;
    
    for (var i = 0; i < len; i++) {
      var t = ts[i]
      
      if (t.handleEvent) {
        var coninues = t.handleEvent(event)
        if (!coninues) {
          break
        }
      }
    }
  }
  
  WrokMap.prototype._addEventsToMap = function () {
    var mapDom = this.mapDom
    var handleEventFn = this._handleEvent.bind(this)
    
    for (var key in EventTag) {
      mapDom.addEventListener(EventTag[key], handleEventFn)
    }
  }
  
  WrokMap.prototype._updateMatrix = function () {
    if (!this.center) {
      return
    }
    
    var center = this.center,
      lev = this.getLevel(this.level),
      size = this.size
    
    var dx1 = size[0] / 2,
      dy1 = size[1] / 2,
      sx = 1 / lev,
      sy = sx,
      angle = 0,
      dx2 = -center[0],
      dy2 = -center[1]
    
    var sin = Math.sin(angle)
    var cos = Math.cos(angle)
    
    var matrix = [0, 0, 0, 0, 0, 0]
    
    matrix[0] = sx * cos
    matrix[1] = sy * sin
    matrix[2] = -sx * sin
    matrix[3] = sy * cos
    matrix[4] = dx2 * sx * cos - dy2 * sx * sin + dx1
    matrix[5] = dx2 * sy * sin + dy2 * sy * cos + dy1
    
    var matrix2 = [0, 0, 0, 0, 0, 0]
    matrix2[0] = matrix[0]
    matrix2[1] = matrix[1]
    matrix2[2] = matrix[2]
    matrix2[3] = matrix[3]
    matrix2[4] = matrix[4]
    matrix2[5] = matrix[5]
    
    var det = matrix2[0] * matrix2[3] - matrix2[1] * matrix2[2]
    var a = matrix2[0]
    var b = matrix2[1]
    var c = matrix2[2]
    var d = matrix2[3]
    var e = matrix2[4]
    var f = matrix2[5]
    
    matrix2[0] = d / det
    matrix2[1] = -b / det
    matrix2[2] = -c / det
    matrix2[3] = a / det
    matrix2[4] = (c * f - d * e) / det
    matrix2[5] = -(a * f - b * e) / det
    
    this.matrix = {
      pixel: matrix,
      coordinate: matrix2
    }
  }
  
  
  WrokMap.prototype.coordinateMapping = function (origE) {
    var mapDom = this.mapDom
    var position = mapDom.getBoundingClientRect()
    var eventPosition = origE
    var srcreePosition = [
      eventPosition.clientX - position.left,
      eventPosition.clientY - position.top
    ]
    
    var x = srcreePosition[0]
    var y = srcreePosition[1]
    
    var mt = this.matrix.coordinate
    
    var newE = {
      oldEvent: origE,
      type: origE.type,
      mapX: mt[0] * x + mt[2] * y + mt[4],
      mapY: mt[1] * x + mt[3] * y + mt[5]
    }
    
    return newE
  }
  
  WrokMap.prototype.flushLightedGeo = function () {
    var geos = this.datasource[0].geos
    geos.forEach(function (g) {
      g.light = false
    })
  }
  
  WrokMap.prototype.findPolygonByClickPoint = function (point) {
    var geos = this.datasource[0].geos
    for (var i = 0, len = geos.length; i < len; i++) {
      var geo = geos[i]
      
      var contained = WrokMap.containsPointPolygon(point, geo.coords)
      if (contained) {
        return geo
      }
    }
    
    return null
  }
  
  WrokMap.prototype.deletePolygonById = function (id) {
    if (id) {
      var delIndex = -1
      var geos = this.datasource[0].geos
      for (var i = 0, len = geos.length; i < len; i++) {
        var geo = geos[i]
        
        if (geo.id === id) {
          delIndex = i
          break
        }
      }
      
      if (delIndex > -1) {
        this.datasource[0].geos.splice(delIndex, 1)
        return true
      }
      
      return false
    }
    
    return false
  }
  
  WrokMap.getInsidePolygon = function (poly1, poly2) {
    var ext1 = poly1.getEnvelop(),
      ext2 = poly2.getEnvelop()
    
    var w1 = ext1[2] - ext1[0],
      h1 = ext1[3] - ext1[1],
      w2 = ext2[2] - ext2[0],
      h2 = ext2[3] - ext2[1]
    
    if (w1 > w2) {
      return poly2
    } else {
      return poly1
    }
  }
  
  WrokMap.containsPointPolygon = function (point, polygon) {
    var px = point[0],
      py = point[1],
      flag = false
    
    for (var i = 0, l = polygon.length, j = l - 1; i < l; j = i, i++) {
      var sx = polygon[i][0],
        sy = polygon[i][1],
        tx = polygon[j][0],
        ty = polygon[j][1]
      
      if ((sx === px && sy === py) || (tx === px && ty === py)) {
        return true
      }
      
      if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
        var x = sx + (py - sy) * (tx - sx) / (ty - sy);
        
        if (x === px) {
          return true
        }
        
        if (x > px) {
          flag = !flag
        }
      }
    }
    
    return flag
  }
//--workmap.js

//--data.js
  
  /**
   *
   * @constructor
   */
  function Data() {
    
  }
  
  Data.prototype.serialize = function (dataCollection) {
    var features = []
    
    dataCollection.forEach(function (geo) {
      var jsonObj = {
        type: 'Feature',
        geometry: {
          type: 'polygon',
          coordinates: geo.getPosition()
        },
        properties: geo.feature
      }
      
      features.push(jsonObj)
    })
    
    var geoJson = {
      type: 'FeatureCollection',
      features: features
    }
    
    return geoJson
  }
  
  Data.prototype.deserialize = function (jsonStr) {
    
  }


//--data.js


//--event.js
  /**
   *
   * @type {{mouseMove: string, mouseDown: string, mouseUp: string, wheel: string, mouseWheel: string, wheel: string, mouseOut: string, mouseOver: string}}
   */
  var EventTag = {
    
    mouseMove: 'mousemove',
    
    mouseDown: 'mousedown',
    
    mouseUp: 'mouseup',
    
    wheel: 'wheel',
    
    mouseWheel: 'mousewheel',
    
    wheel: 'wheel'
  }
//--event.js

//--myimage.js
  /**
   *
   * @param url
   * @constructor
   */
  function MyImage(url) {
    this._map = null
    this.context = null
    this.imageWidth = 0
    this.imageHeight = 0
    this.url = url;
  }
  
  MyImage.prototype.setMap = function (map) {
    this._map = map
    this.context = map.context
    
    var img = new Image()
    img.src = this.url
    
    this.loaded = false
    
    img.onload = (function () {
      this.loaded = true
      this.imageHeight = img.height
      this.imageWidth = img.width
      
      map.canvasHeight = this.imageHeight
      map.canvasWidth = this.imageWidth
      
      map.center = [this.imageWidth / 2, this.imageHeight / 2]
      map.refresh()
    }).bind(this)
    
    this.image = img
  }
  
  
  MyImage.prototype.draw = function () {
    
    if (!this.loaded) {
      return
    }
    
    var context = this.context
    // 处理
    var image = this.image
    var imageWidth = this.imageWidth
    var imageHeight = this.imageHeight
    
    var imageExtent = [0, 0, imageWidth, imageHeight]
    
    var map = this._map
    var center = map.center,
      size = map.size,
      lev = map.getLevel(map.level)
    
    var s = 1 / (lev * 1)
    
    var dx1 = size[0] / 2,
      dy1 = size[1] / 2,
      sx = s,
      sy = -s,
      angle = 0,
      dx2 = 1 * (imageExtent[0] - center[0]) / 1,
      dy2 = 1 * (center[1] - imageExtent[3]) / 1
    
    var T = [1, 0, 0, 1, 0, 0]
    
    var sin = Math.sin(angle)
    var cos = Math.cos(angle)
    T[0] = sx * cos
    T[1] = sy * sin
    T[2] = -sx * sin
    T[3] = sy * cos
    T[4] = dx2 * sx * cos - dy2 * sx * sin + dx1
    T[5] = dx2 * sy * sin + dy2 * sy * cos + dy1
    
    var dx = T[4],
      dy = T[5],
      dw = imageWidth * T[0],
      dh = imageHeight * T[3]
    
    context.drawImage(image, 0, 0, imageWidth, imageHeight, dx, dy, dw, dh)
  }
//--myimage.js


//--mypolygon.js
  /**
   *
   * @constructor
   */
  function MyPolygon() {
    this.coords = []
    this.feature = {}
    this.light = false
    this.display = true
    
    this.fillStyle = null
    
    this.id = uuid()
    this.displayText = ''
  }
  
  MyPolygon.prototype.setPosition = function (values) {
    this.coords = values
  }
  
  MyPolygon.prototype.getPosition = function () {
    return this.coords
  }
  
  MyPolygon.prototype.getEnvelop = function () {
    var coords = this.getPosition()
    if (coords.length === 0) {
      return null
    }
    
    var x0 = Number.POSITIVE_INFINITY
    y0 = Number.POSITIVE_INFINITY
    x1 = Number.NEGATIVE_INFINITY
    y1 = Number.NEGATIVE_INFINITY
    
    coords.forEach(function (point) {
      x0 = Math.min(x0, point[0])
      y0 = Math.min(y0, point[1])
      x1 = Math.max(x1, point[0])
      y1 = Math.max(y1, point[1])
    })
    
    return [x0, y0, x1, y1]
  }
  
  MyPolygon.prototype.invertMartrix = function (c, offset, end, stride, T, opt_dest) {
    var dest = opt_dest ? opt_dest : []
    var i = 0, j
    
    for (j = offset; j < end; j += stride) {
      var x = c[j]
      var y = c[j + 1]
      dest[i++] = T[0] * x + T[2] * y + T[4]
      dest[i++] = T[1] * x + T[3] * y + T[5]
    }
    
    if (opt_dest && dest.length != i) {
      dest.length = i
    }
    
    return dest
  }
  
  MyPolygon.prototype.drawText = function (context, map) {
    var envelop = this.getEnvelop()
    var text = this.displayText
    if (text === '' || text === null) {
      return
    }
    
    context.save()
    context.strokeStyle = 'rgba(255,255,255,1)'
    context.fillStyle = 'rgba(255,0,0,1)'
    context.lineWidth = 2
    
    var invertMartrixFn = this.invertMartrix
    
    var cx = (envelop[0] + envelop[2]) / 2
    cy = (envelop[1] + envelop[3]) / 2
    
    var tempPt = invertMartrixFn([cx, cy], 0, 2, 2, map.matrix.pixel)
    
    
    context.strokeText(text, tempPt[0], tempPt[1])
    context.fillText(text, tempPt[0], tempPt[1])
    
    context.restore()
  }
  
  MyPolygon.prototype.drawLight = function (context, styleConfig, points) {
    if (this.light === false) {
      return
    }
    
    context.save()
    context.fillStyle = 'rgba(255,0,0,0.6)'
    points.forEach(function (p) {
      context.fillRect(p[0] - 7 / 2, p[1] - 7 / 2, 7, 7)
    })
    
    context.restore()
  }
  
  MyPolygon.prototype.draw = function (context, map) {
    if (this.display === false) {
      return
    }
    
    var oldCoords = this.coords
    if (oldCoords.length === 0) {
      return
    }
    
    this.drawText(context, map)
    
    var coords = []
    var invertMartrixFn = this.invertMartrix,
      martrix = map.matrix.pixel
    
    oldCoords.forEach(function (points) {
      var tempPt = invertMartrixFn(points, 0, points.length, 2, martrix)
      tempPt[0] = (tempPt[0] + 0.5) | 0
      tempPt[1] = (tempPt[1] + 0.5) | 0
      
      coords.push(tempPt)
    })
    
    var config = Config.style
    
    this.drawLight(context, config, coords)
    
    context.save()
    context.beginPath()
    
    context.moveTo(coords[0][0], coords[0][1])
    for (var i = 0, len = coords.length; i < len; i++) {
      var pts = coords[i]
      context.lineTo(pts[0], pts[1])
    }
    
    context.closePath()
    
    context.fillStyle = config.fillStyle
    context.fill()
    
    context.strokeStyle = config.strokeStyle.color
    context.lineWidth = config.strokeStyle.width
    context.stroke()
    
    context.restore()
  }
//--mypolygon.js

//--nav.js
  /**
   *
   * @constructor
   */
  function Nav() {
    this.map = null
    this._lastPt = null
    this.active = true
    this.beginNav = false
    this.onNaving = false
  }
  
  Nav.prototype.handleEvent = function (evt) {
    if (!this.active) {
      return true
    }
    
    var ok = true
    var type = evt.type
    switch (type) {
      case EventTag.mouseDown:
        this.handleMouseDown(evt)
        break
      case EventTag.mouseMove:
        this.handleMouseMove(evt)
        break
      case EventTag.mouseUp:
        ok = this.handleMouseUp(evt)
        break
      case EventTag.mouseWheel:
      case EventTag.wheel:
        this.handleMouseWheel(evt)
        break
    }
    
    return ok
  }
  
  
  Nav.prototype.handleMouseWheel = function (evt) {
    var type = evt.type
    var wheelEvent = evt.oldEvent
    wheelEvent.preventDefault()
    
    var anchor = [evt.mapX, evt.mapY]
    
    var map = this.map
    
    var delta = 0
    if (type == EventTag.wheel) {
      delta = wheelEvent.deltaY
    } else if (type == EventTag.mouseWheel) {
      delta = -wheelEvent.wheelDeltaY
    }
    
    if (delta === 0) {
      return
    }
    
    var currentLev = map.getLevel(map.level)
    var currentCenter = map.center
    var newLev
    
    // 放大为正
    if (delta > 0) {
      map.setLevel(-1)
    }
    // 缩小为负
    else {
      map.setLevel(1)
    }
    
    newLev = map.getLevel(map.level)
    
    var x = anchor[0] - newLev * (anchor[0] - currentCenter[0]) / currentLev
    var y = anchor[1] - newLev * (anchor[1] - currentCenter[1]) / currentLev
    
    map.center = [x, y]
    map.refresh()
  }
  
  Nav.prototype.handleMouseDown = function (evt) {
    this.beginNav = true
    
  }
  
  Nav.prototype.handleMouseMove = function(evt) {
    if (!this.beginNav) {
      return false
    }
    
    var movePt = [evt.oldEvent.clientX, evt.oldEvent.clientY]
    this.onNaving = true
    
    if (this._lastPt) {
      var map = this.map,
        lev = map.getLevel(map.level),
        center = map.center
      
      var dx = this._lastPt[0] - movePt[0],
        dy = this._lastPt[1] - movePt[1]
      
      var tempCenter = [dx, dy]
      tempCenter[0] *= lev
      tempCenter[1] *= lev
      
      tempCenter[0] += center[0]
      tempCenter[1] += center[1]
      
      map.center = tempCenter
      map.refresh()
      
      this._lastPt = movePt
      return true
    }
    
    this._lastPt = movePt
    return false
  }
  
  Nav.prototype.handleMouseUp = function (evt) {
    this.beginNav = false
    this._lastPt = null
    
    if (this.onNaving) {
      this.onNaving = false
      return false
    }
    
    return true
  }
  
  
  Nav.prototype.setMap = function (map) {
    this.map = map
  }
//--nav.js


//--paint.js
  /**
   *
   * @param config
   * @constructor
   */
  function Paint(config) {
    config = config ? config : {}
    this.map = null
    this._mouseDownPoint = null
    this._type = config.type || 'polygon'
    this.dataCollection = config.dataCollection
    this._tempPolygon = null
    this._tempPositions = null
    this._killCoordinate = null
    this.active = true
    this.onDrawEnd = config.onDrawEnd ? config.onDrawEnd : function () {}
    
    this._tempDatasource = {
      name: 'tempCollection',
      geos: []
    }
    
    window.onkeyup = (function (evt) {
      var keyCode = evt.keyCode
      if (keyCode === 27) {
        this._returnPrestepPainting()
      }
    }).bind(this)
    
  }
  
  Paint.prototype._returnPrestepPainting = function () {
    if (this._killCoordinate) {
      var len = this._tempPositions.length
      this._tempPositions.splice(len - 2, 1)
      this.map.refresh()
      
      if (this._tempPositions.length === 1) {
        this.flush()
      }
    }
  }
  
  Paint.prototype.handleEvent = function (evt) {
    if (!this.active) {
      return
    }
    
    var type = evt.type
    switch (type) {
      case EventTag.mouseDown:
        this.handleMouseDown(evt)
        break
      case EventTag.mouseMove:
        this.handleMouseMove(evt)
        break
      case EventTag.mouseUp:
        this.handleMouseUp(evt)
        break
    }
    
    return true
  }
  
  Paint.prototype.handleMouseDown = function (evt) {
    this._mouseDownPoint = [evt.mapX, evt.mapY]
  }
  
  Paint.prototype.handleMouseMove = function (evt) {
    if (this._killCoordinate) {
      this.updateDrawing(evt)
    }
  }
  
  Paint.prototype.updateDrawing = function (evt) {
    var pt = [evt.mapX, evt.mapY]
    
    var coordinates = this._tempPositions
    var last = coordinates[coordinates.length - 1]
    
    last[0] = pt[0]
    last[1] = pt[1]
    
    this._tempPolygon.setPosition(coordinates)
    this.map.refresh()
  }
  
  
  Paint.prototype.handleMouseUp = function (evt) {
    if (this._type === null) {
      return
    }
    
    var downPt = this._mouseDownPoint
    var clickPt = [evt.mapX, evt.mapY]
    
    var dx = downPt[0] - clickPt[0],
      dy = downPt[1] - clickPt[1]
    
    var dist = dx * dx + dy * dy
    
    if (dist <= 36) {
      if (!this._killCoordinate) {
        this._doDrawing(evt)
      }
      else if (this._shouldStopDrawing(evt)) {
        this._stopDrawing()
      }
      else {
        this._continuesToDrawing(evt)
      }
    }
  }
  
  Paint.prototype._shouldStopDrawing = function (evt) {
    var stop = false
    if (this._tempPolygon) {
      var potentiallyDone = this._tempPositions.length > 2
      var potentiallyFinishCoordinates = [this._tempPositions[0], this._tempPositions[this._tempPositions.length - 2]]
      
      var t1 = this.map.matrix.pixel
      
      var changeToPiexel = function (T, point) {
        var x = point[0]
        var y = point[1]
        point[0] = T[0] * x + T[2] * y + T[4]
        point[1] = T[1] * x + T[3] * y + T[5]
        return point
      }
      
      var vp = this.map.mapDom.getBoundingClientRect()
      var vpPt = [
        evt.oldEvent.clientX - vp.left,
        evt.oldEvent.clientY - vp.top
      ]
      
      if (potentiallyDone) {
        for (var i = 0, ii = potentiallyFinishCoordinates.length; i < ii; i++) {
          var lastPt = potentiallyFinishCoordinates[i]
          var finishPixel = changeToPiexel(t1, lastPt.slice(0, 2))
          
          var dx = vpPt[0] - finishPixel[0]
          var dy = vpPt[1] - finishPixel[1]
          var snapTolerance = 8
          stop = Math.sqrt(dx * dx + dy * dy) <= snapTolerance
          
          if (stop) {
            this._killCoordinate = finishPixel
            break
          }
        }
      }
    }
    
    return stop
  }
  
  Paint.prototype._clearTempDatasource = function () {
    var dataSouce = this.map.datasource
    
    for (var i = 0, len = dataSouce.length; i < len; i++) {
      var d = dataSouce[i]
      if (d.name === 'tempCollection') {
        d.geos = []
        break
      }
    }
  }
  
  Paint.prototype.flush = function () {
    this._killCoordinate = null
    this._tempDatasource.geos = []
    this._clearTempDatasource()
  }
  
  Paint.prototype._stopDrawing = function () {
    this.flush()
    
    var tempPositions = this._tempPositions
    tempPositions.pop()
    tempPositions.push(tempPositions[0])
    this._tempPolygon.setPosition(tempPositions)
    
    this.onDrawEnd.call()
    this.dataCollection.geos.push(this._tempPolygon)
    this.map.refresh()
  }
  
  Paint.prototype._continuesToDrawing = function (evt) {
    var pt = [evt.mapX, evt.mapY]
    
    var coordinates = this._tempPositions
    coordinates.push(pt.slice())
    
    this._killCoordinate = coordinates[0]
    
    this._tempPolygon.setPosition(this._tempPositions)
    this.map.refresh()
  }
  
  Paint.prototype._doDrawing = function (evt) {
    var pt = [evt.mapX, evt.mapY]
    this._killCoordinate = pt
    
    this._tempPositions = [pt.slice(), pt.slice()]
    this._tempPolygon = null
    
    var polygon = new MyPolygon()
    polygon.tag = 'temp'
    polygon.setPosition(this._tempPositions)
    this._tempPolygon = polygon
    this._tempDatasource.geos.push(this._tempPolygon)
    
    this.map.refresh()
  }
  
  Paint.prototype.setMap = function (map) {
    this.map = map
    map.datasource.push(this._tempDatasource)
  }
  
  Paint.prototype.draw = function () {
    var map = this.map
    var datasource = map.datasource
    var map = this.map
    
    datasource.forEach(function (collection) {
      collection.geos.forEach(function (geo) {
        geo.draw(map.context, map)
      })
    })
  }


//--paint.js

//--paintmrk.js
  /**
   *
   * @constructor
   */
  function PaintMark (onPaintEnd) {
    this.mark = null
    this.marks = []
    this.active = true
    this.isCtrlDown = false
    this.onPaintEndFn = onPaintEnd === undefined ? function () {} : onPaintEnd
    this.onDrawEnd = function() {}
    
    var me = this
    $(window).keyup(function(evt) {
      var keyCode = evt.keyCode
      if (keyCode === 17) {
        me.isCtrlDown = false
      }
      evt.preventDefault()
    })
    
    $(window).keydown(function(evt) {
      var keyCode = evt.keyCode
      if (keyCode === 17) {
        me.isCtrlDown = true
      }
      evt.preventDefault()
    })
  }
  
  // PaintMark.prototype.handleEvent = function (evt) {
  //   if (!this.active) {
  //     return
  //   }
  //
  //   var ok = true
  //   var type = evt.type
  //   switch (type) {
  //     case EventTag.mouseUp:
  //       this.onMouseup(evt)
  //       break
  //   }
  //
  //   return ok
  // }
  
  PaintMark.prototype.onMouseup = function (e) {
    if (!this.active) {
      return
    }
    
    if (!this.isCtrlDown) {
      return
    }
    
    var evt = this.map.coordinateMapping(e)
    var mark = {
      x: evt.mapX,
      y: evt.mapY,
      radius: 10
    }
    
    if( this.delIfInsertExsitMk(mark) ){
      this.map.refresh()
      this.onDrawEnd.call()
      return
    }
    
    this.marks.push(mark)
    this.mark = mark
    this.onPaintEndFn(mark)
    this.onDrawEnd.call()
    
    this.map.refresh()
  }
  
  PaintMark.prototype.draw = function () {
    
    if (this.marks.length === 0 || this.map.matrix === undefined) {
      return
    }
    
    var context = this.context
    var invertMartrixFn = this.invertMartrix
    context.save()
    for(var i = 0, len = this.marks.length ; i < len ; i ++) {
      var m = this.marks[i]
      var points = [m.x, m.y]
      var tempPt = invertMartrixFn(points, 0, points.length, 2, this.map.matrix.pixel)
      context.fillStyle = 'rgba(255,0,0,0.6)'
      context.fillRect(tempPt[0] - m.radius/2, tempPt[1] - m.radius/ 2, m.radius, m.radius)
    }
    
    context.restore()
  }
  
  PaintMark.prototype.setMap = function (map) {
    this.map = map
    this.context = map.context
    
    var container = map.mapDom
    
    var me = this
    $(container).mouseup(function(e){
      me.onMouseup(e)
    })
  }
  
  PaintMark.prototype.invertMartrix = function (c, offset, end, stride, T, opt_dest) {
    var dest = opt_dest ? opt_dest : []
    var i = 0, j
    
    for (j = offset; j < end; j += stride) {
      var x = c[j]
      var y = c[j + 1]
      dest[i++] = T[0] * x + T[2] * y + T[4]
      dest[i++] = T[1] * x + T[3] * y + T[5]
    }
    
    if (opt_dest && dest.length != i) {
      dest.length = i
    }
    
    return dest
  }
  
  PaintMark.prototype.delIfInsertExsitMk = function (p) {
    var mks = this.marks
    
    var del = -1
    for (var i = 0;i < mks.length ; i ++) {
      if (PaintMark.insertPoint(mks[i], p)) {
        del = i
        break
      }
    }
    
    if (del > -1) {
      this.marks.splice(del, 1)
      return true
    }
    
    return false
  }
  
  PaintMark.insertPoint = function (p1, p2) {
    var d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    if (d <= 7) {
      return true
    }
    
    return false
  }
//--paintmrk.js
  
}(window);