/*
 * Rhombic Dodecahedron map
 *
 * Implemented for D3.js by Ronnie Bathoorn (2024)
 * based on Cubic map by Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import { atan, degrees } from "./math.js";
import voronoi from "./polyhedral/voronoi.js";
import { geoCentroid } from "d3-geo";

export default function () {
  var phi1 = atan(Math.SQRT1_2) * degrees;
  var vertices = [
    [0, 90], // 0
    [0, phi1], // 1
    [90, phi1], // 2
    [180, phi1], // 3
    [-90, phi1], // 4
    [45, 0], // 5
    [135, 0], // 6
    [-135, 0], // 7
    [-45, 0], // 8
    [0, -phi1], // 9
    [90, -phi1], // 10
    [180, -phi1], // 11
    [-90, -phi1], // 12
    [0, -90], // 13
  ];

  // rhombic dodecahedron
  var polyhedron = [
    [0, 1, 8, 4],
    [0, 2, 5, 1],
    [0, 3, 6, 2],
    [0, 4, 7, 3],

    [1, 5, 9, 8],
    [2, 6, 10, 5],
    [3, 7, 11, 6],
    [4, 8, 12, 7],

    [8, 9, 13, 12],
    [5, 10, 13, 9],
    [6, 11, 13, 10],
    [7, 12, 13, 11],
  ].map(function (face) {
    return face.map(function (i) {
      return vertices[i];
    });
  });

  var polygons = {
    type: "FeatureCollection",
    features: polyhedron.map(function (face) {
      return {
        properties: {
          sitecoordinates: geoCentroid({
            type: "MultiPoint",
            coordinates: face,
          }),
        },
        geometry: {
          type: "Polygon",
          coordinates: [[...face, face[0]]],
        },
      };
    }),
  };

  var parents = [
    -1, // 0
    0, // 1
    6, // 2
    2, // 3
    1, // 4
    9, // 5
    11, // 6
    3, // 7
    4, // 8
    8, // 9
    5, // 10
    10, // 11
  ];

  return voronoi()
    .polygons(polygons)
    .parents(parents)
    .angle(20)
    .rotate([0.001, 0])
    .translate([213, 252])
    .scale(106.48)
}
