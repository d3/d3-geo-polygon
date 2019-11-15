var tape = require("tape"),
    d3 = require("../"),
    d3_geo = require("d3-geo");
require("./projectionEqual");


tape("inverse polyhedrals", function(test) {

  [ d3.geoAirocean(), d3.geoCubic(), d3.geoIcosahedral(), d3.geoDodecahedral() ]
  .forEach(function(projection) {
    [ [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      test.projectionEqual(projection, location, projection(location), 1e-5);
    });
  });
  test.end();
});

tape("inverse Imago", function(test) {

  [ d3.geoImago(), d3.geoImagoBlock() ]
  .forEach(function(projection) {
    [ [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      test.projectionEqual(projection, location, projection(location), 1e-5);
    });
  });
  test.end();
});

tape("inverse complex log", function(test) {

  [ d3.geoComplexLog() ]
  .forEach(function(projection) {
    [ [0, 0], [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      test.projectionEqual(projection, location, projection(location), 1e-5);
    });
  });
  test.end();
});

