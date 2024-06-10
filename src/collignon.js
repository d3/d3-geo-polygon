import {geoCentroid as centroid, geoProjection as projection} from "d3-geo";
import {asin, pi, sin, sqrt, sqrtPi} from "./math.js";
import polyhedral from "./polyhedral/index.js";
import octahedron from "./polyhedral/octahedron.js";

// code duplicated from d3-geo-projection
export function collignonRaw(lambda, phi) {
  const alpha = sqrt(1 - sin(phi));
  return [(2 / sqrtPi) * lambda * alpha, sqrtPi * (1 - alpha)];
}

collignonRaw.invert = function(x, y) {
  const lambda = (y / sqrtPi - 1);
  return [lambda ? x * sqrt(pi) / lambda / 2 : 0, asin(1 - lambda ** 2)];
};


const kx = 2 / sqrt(3);

function collignonK(a, b) {
  const p = collignonRaw(a, b);
  return [p[0] * kx, p[1]];
}

collignonK.invert = (x,y) => collignonRaw.invert(x / kx, y);

export default function(faceProjection = (face) => {
  const c = centroid({type: "MultiPoint", coordinates: face});
  return projection(collignonK).translate([0, 0]).scale(1).rotate(c[1] > 0 ? [-c[0], 0] : [180 - c[0], 180]);
}) {
  const faces = octahedron.map((face) => ({face, project: faceProjection(face)}));

  [-1, 0, 0, 1, 0, 1, 4, 5].forEach((d, i) => {
    const node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  return polyhedral(
    faces[0],
    (lambda, phi) => faces[lambda < -pi / 2 ? phi < 0 ? 6 : 4
            : lambda < 0 ? phi < 0 ? 2 : 0
            : lambda < pi / 2 ? phi < 0 ? 3 : 1
            : phi < 0 ? 7 : 5])
    .angle(-30)
    .scale(121.906)
    .center([0, 48.5904]);
}
