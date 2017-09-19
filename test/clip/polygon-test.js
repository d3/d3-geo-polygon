var tape = require("tape"),
    d3 = require("../../"),
    d3_geo = require("d3-geo");

tape("clipPolygon clips line", function(test) {
  var clipPolygon = d3.geoClipPolygon({ type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]] });
  var projection = d3_geo.geoEquirectangular().clipAngle(10).preclip(clipPolygon);
  var path = d3_geo.geoPath()
    .projection(projection);
  test.equal(path({type:"LineString", coordinates:[[-20,0], [20,0]]}), path({type:"LineString", coordinates:[[-10.5,0], [10.5,0]]}));
  test.end();
});

