var tape = require("tape"),
    d3 = require("../"),
    d3_geo = require("d3-geo");

require("./inDelta");

var e;

tape("spherical intersections", function(test) {
  e = d3.geoIntersectArc([[0,0], [0,90]], [[-10,40], [10,40]]); 
  test.assert(e);
  test.inDelta(e, [ 0, 40.43246108], 1e-8);

  // https://observablehq.com/@fil/spherical-intersection#points
  var p = [[0, 70], [-10, 10], [-40, 30], [10, 45]];

  test.inDelta(d3.geoIntersectArc([p[0], p[1]], [p[0], p[3]]), p[0], 1e-8);
  test.inDelta(d3.geoIntersectArc([p[0], p[1]], [p[1], p[3]]), p[1], 1e-8);
  test.inDelta(d3.geoIntersectArc([p[0], p[1]], [p[2], p[0]]), p[0], 1e-8);
  test.inDelta(d3.geoIntersectArc([p[0], p[1]], [p[2], p[1]]), p[1], 1e-8);

  test.inDelta(
    d3.geoIntersectArc([p[0], p[1]], [p[2], p[3]]),
    [ -7.081398732358556, 42.94731141237317 ], 1e-8);

  test.inDelta(
    d3.geoIntersectArc([p[1], p[0]], [p[2], p[3]]),
    [ -7.081398732358556, 42.94731141237317 ], 1e-8);

  test.false(d3.geoIntersectArc([p[2], p[1]], [p[0], p[3]]));

  test.inDelta(
    d3.geoIntersectArc([[0, 89.99], [0, -89.99]], [[-89.99, 0], [89.99, 0]]),
    [0,0], 1e-8);

  test.inDelta(
    d3.geoIntersectArc([[0, 89.99], [0, -89.99]], [[0, 0], [25, 0]]),
    [0,0], 1e-8);

  e = d3.geoIntersectArc([[0,0], [0,90]], [[0,0], [90,0]]); 
  test.deepEqual(e, [0, 0]);

  test.false(d3.geoIntersectArc([[0,0], [0,90]], [[10,0], [90,0]]));

  test.end();
});
