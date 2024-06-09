import {geoCentroid as centroid, geoGnomonic as gnomonic} from "d3-geo";
import {pi} from "../math.js";
import polyhedral from "./index.js";
import octahedron from "./octahedron.js";

export default function(faceProjection = ((face) => {
  const c = centroid({type: "MultiPoint", coordinates: face});
  return gnomonic().scale(1).translate([0, 0]).rotate([-c[0], -c[1]]);
})) {
  const faces = octahedron.map((face) => ({face, project: faceProjection(face)}));

  [-1, 0, 0, 1, 0, 1, 4, 5].forEach((d, i) => {
    const node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  return polyhedral(
      faces[0],
      (lambda, phi) => faces[
        lambda < -pi / 2 ? phi < 0 ? 6 : 4
          : lambda < 0 ? phi < 0 ? 2 : 0
          : lambda < pi / 2 ? phi < 0 ? 3 : 1
          : phi < 0 ? 7 : 5]
      )
    .angle(-30)
    .scale(101.858)
    .center([0, 45]);
}
