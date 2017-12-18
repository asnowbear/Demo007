/**
 * Created by zhangyong on 2017/12/18.
 */

/**
 * 保存按钮点击
 */
$('#saveBtn').click(function(e){
  
  var geos = dataCollection.geos
  
  var resultJson = data.serialize(geos)
  
  console.log(resultJson)
  
})