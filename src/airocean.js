/*
 * Buckminster Fuller’s AirOcean arrangement of the icosahedron
 *
 * Implemented for D3.js by Jason Davies (2013),
 * Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */
import { atan, degrees } from "./math";
import polyhedral from "./polyhedral/index";
import { default as grayFullerRaw } from "./grayfuller";
import {
  geoCentroid as centroid,
  geoContains as contains,
  geoGnomonic as gnomonic,
  geoProjection as projection
} from "d3-geo";
import { range } from "d3-array";

function airoceanRaw(faceProjection) {
  var theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  var vertices = [[0, 90], [0, -90]].concat(
    range(10).map(function(i) {
      var phi = (i * 36 + 180) % 360 - 180;
      return [phi, i & 1 ? theta : -theta];
    })
  );

  // icosahedron
  var polyhedron = [
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
  ].map(function(face) {
    return face.map(function(i) {
      return vertices[i];
    });
  });

  // add centroid
  polyhedron.forEach(function(face) {
    face.centroid = centroid({ type: "MultiPoint", coordinates: face });
  });

  // split the relevant faces:
  // * face[15] in the centroid: this will become face[15], face[20] and face[21]
  // * face[14] in the middle of the side: this will become face[14] and face[22]
  (function() {
    var face, tmp, mid, centroid;

    // Split face[15] in 3 faces at centroid.
    face = polyhedron[15];
    centroid = face.centroid;
    tmp = face.slice();
    face[0] = centroid; // (new) face[15]

    face = [tmp[0], centroid, tmp[2]];
    face.centroid = centroid;
    polyhedron.push(face); // face[20]

    face = [tmp[0], tmp[1], centroid];
    face.centroid = centroid;
    polyhedron.push(face); // face[21]

    // Split face 14 at the edge.
    face = polyhedron[14];
    centroid = face.centroid;
    tmp = face.slice();

    // compute planar midpoint
    var proj = gnomonic()
      .scale(1)
      .translate([0, 0])
      .rotate([-centroid[0], -centroid[1]]);
    var a = proj(face[1]),
      b = proj(face[2]);
    mid = proj.invert([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    face[1] = mid; // (new) face[14]

    // build the new half face
    face = [tmp[0], tmp[1], mid];
    face.centroid = centroid; // use original face[14] centroid
    polyhedron.push(face); // face[22]

    // cut face 19 to connect to 22
    face = polyhedron[19];
    centroid = face.centroid;
    tmp = face.slice();
    face[1] = mid;

    // build the new half face
    face = [mid, tmp[0], tmp[1]];
    face.centroid = centroid;
    polyhedron.push(face); // face[23]
  })();

  var airocean = function(faceProjection) {
    faceProjection =
      faceProjection ||
      function(face) {
        // for half-triangles this is definitely not centroid({type: "MultiPoint", coordinates: face});
        var c = face.centroid;
        return gnomonic()
          .scale(1)
          .translate([0, 0])
          .rotate([-c[0], -c[1]]);
      };

    var faces = polyhedron.map(function(face, i) {
      var polygon = face.slice();
      polygon.push(polygon[0]);

      return {
        face: face,
        site: face.centroid,
        id: i,
        contains: function(lambda, phi) {
          return contains({ type: "Polygon", coordinates: [polygon] }, [
            lambda * degrees,
            phi * degrees
          ]);
        },
        project: faceProjection(face)
      };
    });

    // Connect each face to a parent face.
    var parents = [
      // N
      -1, // 0
      0, // 1
      1, // 2
      11, // 3
      13, // 4

      // Eq
      6, // 5
      7, // 6
      1, // 7
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
      17, // 18
      21, // 19
      16, // 20
      15, // 21
      19, // 22
      19 // 23
    ];

    parents.forEach(function(d, i) {
      var node = faces[d];
      node && (node.children || (node.children = [])).push(faces[i]);
    });

    function face(lambda, phi) {
      for (var i = 0; i < faces.length; i++) {
        if (faces[i].contains(lambda, phi)) return faces[i];
      }
    }

    // Polyhedral projection
    var proj = polyhedral(
      faces[0], // the root face
      face, // a function that returns a face given coords
      -60 // rotation of the root face in the projected (pixel) space
    );

    proj.faces = faces;
    return proj;
  };

  return airocean(faceProjection);
}

export default function () {
  var p = airoceanRaw(function(face) {
    var c = face.centroid;

    face.direction =
      Math.abs(c[1] - 52.62) < 1 || Math.abs(c[1] + 10.81) < 1 ? 0 : 60;
    return projection(grayFullerRaw())
      .scale(1)
      .translate([0, 0])
      .rotate([-c[0], -c[1], face.direction || 0]);
  });

  return p
    .rotate([-83.65929, 25.44458, -87.45184])
    .scale(45.4631)
    .center([126, 0]);
}
