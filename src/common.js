
/**
 * 保存按钮点击
 */
$('#saveBtn').click(function(e){
  
  var geos = dataCollection.geos
  
  var resultJson = data.serialize(geos)
  
  console.log(resultJson)
  
})