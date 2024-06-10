import {acos, asin, degrees, sqrt} from "./math.js";
import voronoi from "./polyhedral/voronoi.js";

export default function() {
  const A0 = asin(1/sqrt(3)) * degrees;
  const A1 = acos((sqrt(5) - 1) / sqrt(3) / 2) * degrees;
  const A2 = 90 - A1;
  const A3 = acos(-(1 + sqrt(5)) / sqrt(3) / 2) * degrees;

  const dodecahedron = [
    [[45,A0],[0,A1],[180,A1],[135,A0],[90,A2]],
    [[45,A0],[A2,0],[-A2,0],[-45,A0],[0,A1]],
    [[45,A0],[90,A2],[90,-A2],[45,-A0],[A2,0]],
    [[0,A1],[-45,A0],[-90,A2],[-135,A0],[180,A1]],
    [[A2,0],[45,-A0],[0,-A1],[-45,-A0],[-A2,0]],
    [[90,A2],[135,A0],[A3,0],[135,-A0],[90,-A2]],
    [[45,-A0],[90,-A2],[135,-A0],[180,-A1],[0,-A1]],
    [[135,A0],[180,A1],[-135,A0],[-A3,0],[A3,0]],
    [[-45,A0],[-A2,0],[-45,-A0],[-90,-A2],[-90,A2]],
    [[-45,-A0],[0,-A1],[180,-A1],[-135,-A0],[-90,-A2]],
    [[135,-A0],[A3,0],[-A3,0],[-135,-A0],[180,-A1]],
    [[-135,A0],[-90,A2],[-90,-A2],[-135,-A0],[-A3,0]]
  ];


  const polygons = {
    type: "FeatureCollection",
    features: dodecahedron.map((face) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ [...face, face[0]] ]
      }
    }))
  };

  return voronoi()
   .parents([-1,0,4,8,1,2,2,3,1,8,6,3])
   .angle(72 * 1.5)
   .polygons(polygons)
   .scale(99.8)
   .rotate([-8,0,-32]);
}