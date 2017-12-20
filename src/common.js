
/**
 * 保存按钮点击
 */
$('#saveBtn').click(function(e){
  
  var geos = dataCollection.geos
  
  var resultJson = data.serialize(geos)
  
  console.log(resultJson)
  
})

// $(window).resize(resizeCanvas);

function resizeCanvas() {
  
  var width = $(window).get(0).innerWidth - 50,
      height = $(window).get(0).innerHeight - 100
  
  $("#workMap").css({"width":width + 'px',"height" : height + "px"})
  $("#can").attr("width", width)
  $("#can").attr("height", height)
}