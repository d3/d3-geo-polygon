/*
 * Cubic map
 *
 * Implemented for D3.js by Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import voronoi from "./polyhedral/voronoi";
import { default as cube } from "../node_modules/d3-geo-projection/src/polyhedral/cube";

export default function() {
  var polygons = {
    type: "FeatureCollection",
    features: cube.map(function(face) {
      face = face.slice();
      face.push(face[0]);
      return {
        geometry: {
          type: "Polygon",
          coordinates: [face]
        }
      };
    })
  };

  var parents = [-1, 0, 1, 5, 3, 2];

  return voronoi()
    .polygons(polygons)
    .parents(parents)
    .angle(0)
    .scale(96.8737)
    .center([135, -45])
    .rotate([120,0]);
}

