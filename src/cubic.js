/*
 * Cubic map
 *
 * Implemented for D3.js by Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import voronoi from "./polyhedral/voronoi.js";
import { default as cube } from "./polyhedral/cube.js";

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
    .angle(0)
    .scale(96.8737)
    .center([135, -45])
    .rotate([120,0]);
}

