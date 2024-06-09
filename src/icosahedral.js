/*
 * Icosahedral map
 *
 * Implemented for D3.js by Jason Davies (2013),
 * Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import { atan, degrees } from "./math.js";
import voronoi from "./polyhedral/voronoi.js";


export default function() {
  const theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  const vertices = [[0, 90], [0, -90]].concat(
    [0,1,2,3,4,5,6,7,8,9].map((i) => [(i * 36 + 180) % 360 - 180, i & 1 ? theta : -theta])
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
    [1, 10, 2] // South
  ].map((face) => face.map((i) => vertices[i]));

  const polygons = {
    type: "FeatureCollection",
    features: polyhedron.map((face) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[...face, face[0]]]
      }
    }))
  };

const parents = [
      // N
      -1, // 0
      7, // 1
      9, // 2
      11, // 3
      13, // 4

      // Eq
      0, // 5
      5, // 6
      6, // 7
      7, // 8
      8, // 9

      9, // 10
      10, // 11
      11, // 12
      12, // 13
      13, // 14

      // S
      6, // 15
      8, // 16
      10, // 17
      12, // 18
      14, // 19
    ];

  return voronoi()
    .parents(parents)
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