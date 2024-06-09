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
import { geoCentroid, geoInterpolate } from "d3-geo";

export default function () {
  const theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  const vertices = [[0, 90], [0, -90]].concat(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [
      ((i * 36 + 180) % 360) - 180,
      i & 1 ? theta : -theta
    ])
  );

  // icosahedron
  const polyhedron = [
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
    [1, 10, 2], // South
  ].map((face) => {
    const t = face.map((i) => vertices[i]);
    // create 3 polygons from these using centroid and midpoints
    const a0 = geoInterpolate(t[1], t[2])(0.5);
    const a1 = geoInterpolate(t[0], t[2])(0.5);
    const a2 = geoInterpolate(t[0], t[1])(0.5);
    const c = geoCentroid({ type: "MultiPoint", coordinates: t });
    return [
      [t[0], a2, c, a1],
      [t[1], a0, c, a2],
      [t[2], a1, c, a0]
    ];
  });

  const polygons = {
    type: "FeatureCollection",
    features: polyhedron.flat().map((face) => ({
      type: "Feature",
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
    }))
  };

  const parents = [
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
    .polygons(polygons)
    .angle(3)
    .rotate([108, 0])
    .translate([72, 252])
    .scale(136.67);
}
