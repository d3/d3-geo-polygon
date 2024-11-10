/*
 * Cubic map
 *
 * Implemented for D3.js by Enrico Spinielli (2017) and Philippe Rivière (2017—2024)
 *
 */
import voronoi from "./polyhedral/voronoi.js";
import {atan, degrees, sqrt1_2} from "./math.js";

const phi1 = atan(sqrt1_2) * degrees;
const cube1 = [
  [0, phi1], [90, phi1], [180, phi1], [-90, phi1],
  [0, -phi1], [90, -phi1], [180, -phi1], [-90, -phi1]
];
const cube = [
  [0, 3, 2, 1], // N
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
  [4, 5, 6, 7] // S
].map((face) => face.map((i) => cube1[i]));

export default function() {
  const polygons = {
    type: "FeatureCollection",
    features: cube.map((face) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[...face, face[0]]]
      }
    }))
  };

  const parents = [-1, 0, 1, 5, 3, 2];

  return voronoi()
    .polygons(polygons)
    .parents(parents)
    .scale(96.8737)
    .center([135, -45])
    .rotate([120,0]);
}

