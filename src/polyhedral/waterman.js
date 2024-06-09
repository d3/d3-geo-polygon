import {geoCentroid as centroid, geoGnomonic as gnomonic} from "d3-geo";
import {asin, atan2, cos, degrees, max, min, pi, radians, sin} from "../math.js";
import polyhedral from "./index.js";
import octahedron from "./octahedron.js";

export default function(faceProjection = ((face) => {
  const c = face.length === 6 ? centroid({type: "MultiPoint", coordinates: face}) : face[0];
  return gnomonic().scale(1).translate([0, 0]).rotate([-c[0], -c[1]]);
})) {
  const w5 = octahedron.map((face) => {
    const xyz = face.map(cartesian);
    const n = xyz.length;
    const hexagon = [];
    let a = xyz[n - 1], b;
    for (let i = 0; i < n; ++i) {
      b = xyz[i];
      hexagon.push(spherical([
        a[0] * 0.9486832980505138 + b[0] * 0.31622776601683794,
        a[1] * 0.9486832980505138 + b[1] * 0.31622776601683794,
        a[2] * 0.9486832980505138 + b[2] * 0.31622776601683794
      ]), spherical([
        b[0] * 0.9486832980505138 + a[0] * 0.31622776601683794,
        b[1] * 0.9486832980505138 + a[1] * 0.31622776601683794,
        b[2] * 0.9486832980505138 + a[2] * 0.31622776601683794
      ]));
      a = b;
    }
    return hexagon;
  });

  const cornerNormals = [];

  const parents = [-1, 0, 0, 1, 0, 1, 4, 5];

  w5.forEach((hexagon, j) => {
    const face = octahedron[j],
        n = face.length,
        normals = cornerNormals[j] = [];
    for (let i = 0; i < n; ++i) {
      w5.push([
        face[i],
        hexagon[(i * 2 + 2) % (2 * n)],
        hexagon[(i * 2 + 1) % (2 * n)]
      ]);
      parents.push(j);
      normals.push(cross(
        cartesian(hexagon[(i * 2 + 2) % (2 * n)]),
        cartesian(hexagon[(i * 2 + 1) % (2 * n)])
      ));
    }
  });

  const faces = w5.map((face) => ({
    project: faceProjection(face),
    face
  }));

  parents.forEach((d, i) => {
    const parent = faces[d];
    parent && (parent.children || (parent.children = [])).push(faces[i]);
  });

  function face(lambda, phi) {
    const cosphi = cos(phi);
    const p = [cosphi * cos(lambda), cosphi * sin(lambda), sin(phi)];

    const hexagon = lambda < -pi / 2 ? phi < 0 ? 6 : 4
        : lambda < 0 ? phi < 0 ? 2 : 0
        : lambda < pi / 2 ? phi < 0 ? 3 : 1
        : phi < 0 ? 7 : 5;

    const n = cornerNormals[hexagon];

    return faces[dot(n[0], p) < 0 ? 8 + 3 * hexagon
        : dot(n[1], p) < 0 ? 8 + 3 * hexagon + 1
        : dot(n[2], p) < 0 ? 8 + 3 * hexagon + 2
        : hexagon];
  }

  return polyhedral(faces[0], face)
    .angle(-30)
    .scale(110.625)
    .center([0, 45]);
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; ++i) s += a[i] * b[i];
  return s;
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

// Converts 3D Cartesian to spherical coordinates (degrees).
function spherical(cartesian) {
  return [
    atan2(cartesian[1], cartesian[0]) * degrees,
    asin(max(-1, min(1, cartesian[2]))) * degrees
  ];
}

// Converts spherical coordinates (degrees) to 3D Cartesian.
function cartesian(coordinates) {
  const lambda = coordinates[0] * radians;
  const phi = coordinates[1] * radians;
  const cosphi = cos(phi);
  return [
    cosphi * cos(lambda),
    cosphi * sin(lambda),
    sin(phi)
  ];
}
