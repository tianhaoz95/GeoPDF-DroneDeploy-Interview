$(document).ready(function () {
  $("#generate-btn").click(function () {
    new DroneDeploy({version: 1}).then(function(dronedeploy){
      dronedeploy.Plans.getCurrentlyViewed().then(function (plan) {
        console.log("Plan: ", plan);
        var zoom = 20
        dronedeploy.Tiles.get({planId: plan.id, layerName: 'ortho', zoom: zoom})
        .then(function (res) {
          const tiles = getTilesFromGeometry(plan.geometry, res.template, zoom)
          var imgHtml = ""
          for (var i = 0; i < tiles.length; ++i) {
            var temp = '<div style="display:inline-block;white-space:nowrap"><img style="width:50px" src="'+tiles[i]+'"/></div>'
            if (i % 11 === 10) {
              temp = temp + '<br/>'
            }
            imgHtml = imgHtml + temp
          }
          var completeHtml = "<div class=\"mapimages\">" + "<p>It will start download after 10 sec</p>" + imgHtml + "</div>"
          var newWindow = window.open()
          newWindow.document.write(completeHtml)
          newWindow.document.write("<script src='https://ajax.googleapis.com/ajax/libs/jquery/2.2.1/jquery.min.js'></script>")
          setTimeout(function () {
            newWindow.print()
            newWindow.close()
          }, 10000);
        })
        .catch(function (err) {
          console.log(err)
        })
      })
      .catch(function (err) {
        console.log(err)
      })
    })
    .catch(function (err) {
      console.log(err)
    })
  })
})

function getTilesFromGeometry(geometry, template, zoom){
  function long2tile(lon,zoom) {
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
  }
  function lat2tile(lat,zoom) {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
  }
  function replaceInTemplate(point){
    return template.replace('{z}', point.z)
      .replace('{x}', point.x)
      .replace('{y}', point.y);
  }
  var allLat = geometry.map(function(point){
    return point.lat;
  });
  var allLng = geometry.map(function(point){
    return point.lng;
  });
  var minLat = Math.min.apply(null, allLat);
  var maxLat = Math.max.apply(null, allLat);
  var minLng = Math.min.apply(null, allLng);
  var maxLng = Math.max.apply(null, allLng);
  var top_tile    = lat2tile(maxLat, zoom); // eg.lat2tile(34.422, 9);
  var left_tile   = long2tile(minLng, zoom);
  var bottom_tile = lat2tile(minLat, zoom);
  var right_tile  = long2tile(maxLng, zoom);
  var tiles = [];
  for (var y = top_tile; y < bottom_tile + 1; y++) {
    for (var x = left_tile; x < right_tile + 1; x++) {
      tiles.push(replaceInTemplate({x, y, z: zoom}))
    }
  }
  return tiles;
}
