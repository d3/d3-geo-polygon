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


tape("clipPolygon interpolates when the intersections are on the same segment", function(test) {
  var clipPolygon = d3.geoClipPolygon({
    type: "Polygon",
    coordinates: [[[-10, -11], [10, 10], [11, -10], [-10, -11]]]
  }),
    projection = d3_geo.geoEquirectangular().preclip(clipPolygon).precision(0.1),
    path = d3_geo.geoPath().projection(projection);
  test.equal(path({
    type: "Polygon",
    coordinates: [[[0, -11], [1, -11], [1, -10], [0, -10], [0, -11]]]
  }).replace(/[.]\d+/g, ""),
  "M482,278L482,276L480,276L480,278L466,279L453,279L506,223L509,276L495,277Z");
  test.end();
});
