/*
 * Deltoidal Hexecontahedron map
 *
 * Implemented for D3.js by Ronnie Bathoorn (2024),
 * based on Icosahedron map by Jason Davies (2013)
 * Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import { atan, degrees } from "./math.js";
import voronoi from "./polyhedral/voronoi.js";


export default function() {
  var theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  var vertices = [[0, 90], [0, -90]].concat(
    [0,1,2,3,4,5,6,7,8,9].map(function(i) {
      var phi = (i * 36 + 180) % 360 - 180;
      return [phi, i & 1 ? theta : -theta];
    })
  );

  // icosahedron
  var polyhedron = [
    [0, 3, 11],
    [0, 5, 3],
    [0, 7, 5],
    [0, 9, 7],
    [0, 11, 9], // North
    [2, 11, 3],
    [3, 4, 2],
    [4, 3, 5],
    [5, 6, 4],
    [6, 5, 7],
    [7, 8, 6],
    [8, 7, 9],
    [9, 10, 8],
    [10, 9, 11],
    [11, 2, 10], // Equator
    [1, 2, 4],
    [1, 4, 6],
    [1, 6, 8],
    [1, 8, 10],
    [1, 10, 2] // South
  ].map(function(face) {
    var t = face.map(function(i) {
      return vertices[i];
    });
    // create 3 polygons from these using centroid and midpoints
    var f1 = [
      t[0], 
      d3.geoInterpolate(t[0],t[1])(0.5), 
      d3.geoCentroid({type:"MultiPoint", coordinates:t}), 
      d3.geoInterpolate(t[0],t[2])(0.5)
    ];
    var f2 = [
      t[1], 
      d3.geoInterpolate(t[1],t[2])(0.5), 
      d3.geoCentroid({type:"MultiPoint", coordinates:t}), 
      d3.geoInterpolate(t[1],t[0])(0.5)
    ];
    var f3 = [
      t[2], 
      d3.geoInterpolate(t[2],t[0])(0.5), 
      d3.geoCentroid({type:"MultiPoint", coordinates:t}), 
      d3.geoInterpolate(t[2],t[1])(0.5)
    ];
    return [f1, f2, f3];
  });

  var polygons = {
    type: "FeatureCollection",
    features: polyhedron.flat().map(function(face) {
      face.push(face[0]);
      return {
        properties: { sitecoordinates: d3.geoCentroid({type:"MultiPoint", coordinates: face}) },
        geometry: {
          type: "Polygon",
          coordinates: [ face ]
        }
      };
    })
  };

  var parents = [
      -1, // 0
      2, // 1
      0, // 2
      5, // 3
      5, // 4
      22, // 5
      8, // 6
      8, // 7
      28, // 8
      11, // 9
      11, // 10
      34, // 11
      14, // 12
      14, // 13
      40, // 14
      16, // 15
      2, // 16
      16, // 17
      17, // 18
      18, // 19
      18, // 20
      19, // 21
      21, // 22
      21, // 23
      23, // 24
      24, // 25
      24, // 26
      25, // 27
      27, // 28
      27, // 29
      29, // 30
      30, // 31
      30, // 32
      31, // 33
      33, // 34
      33, // 35
      35, // 36
      36, // 37
      36, // 38
      37, // 39
      39, // 40
      39, // 41
      41, // 42
      42, // 43
      42, // 44
      46, // 45
      20, // 46
      46, // 47
      49, // 48
      26, // 49
      49, // 50
      52, // 51
      32, // 52
      52, // 53
      55, // 54
      38, // 55
      55, // 56
      58, // 57
      44, // 58
      58, // 59
    ];

  //return polygons;
  return voronoi()
  .parents(parents)
  .angle(0)
  .polygons(polygons)
  .rotate([108,0])
  .scale(131.777)
  .center([162, 0]);
  }


/*
    // Jarke J. van Wijk, "Unfolding the Earth: Myriahedral Projections",
    // The Cartographic Journal Vol. 45 No. 1 pp. 32–42 February 2008, fig. 8
    // https://bl.ocks.org/espinielli/475f5fde42a5513ab7eba3f53033ea9e
    d3.geoIcosahedral().parents([-1,0,1,11,3,0,7,1,7,8,9,10,11,12,13,6,8,10,19,15])
   .angle(-60)
   .rotate([-83.65929, 25.44458, -87.45184])
*/