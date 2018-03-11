import {
  geoProjection as projection,
  geoStereographicRaw,
  geoCentroid,
  geoContains
} from "d3-geo";
import polyhedral from "./polyhedral/index";
import { scan } from "d3-array";
import { abs, asin, degrees, sqrt } from "./math";
import {
  complexAdd,
  complexMul,
  complexNorm,
  complexPow,
  complexSub
} from "./complex";

export function leeRaw(lambda, phi) {
  // return d3.geoGnomonicRaw(...arguments);
  var w = [-1 / 2, sqrt(3) / 2],
    k = [0, 0],
    h = [0, 0],
    i,
    z = complexMul(geoStereographicRaw(lambda, phi), [sqrt(2), 0]);

  // rotate to have s ~= 1
  var sector = scan(
    [0, 1, 2].map(function(i) {
      return -complexMul(z, complexPow(w, [i, 0]))[0];
    })
  );
  var rot = complexPow(w, [sector, 0]);

  var n = complexNorm(z);

  if (n > 0.3) {
    // if |z| > 0.5, use the approx based on y = (1-z)
    // McIlroy formula 6 p6 and table for G page 16
    var y = complexSub([1, 0], complexMul(rot, z));

    // w1 = gamma(1/3) * gamma(1/2) / 3 / gamma(5/6);
    // https://bl.ocks.org/Fil/1aeff1cfda7188e9fbf037d8e466c95c
    var w1 = 1.4021821053254548;

    var G0 = [
      1.15470053837925,
      0.192450089729875,
      0.0481125224324687,
      0.010309826235529,
      3.34114739114366e-4,
      -1.50351632601465e-3,
      -1.2304417796231e-3,
      -6.75190201960282e-4,
      -2.84084537293856e-4,
      -8.21205120500051e-5,
      -1.59257630018706e-6,
      1.91691805888369e-5,
      1.73095888028726e-5,
      1.03865580818367e-5,
      4.70614523937179e-6,
      1.4413500104181e-6,
      1.92757960170179e-8,
      -3.82869799649063e-7,
      -3.57526015225576e-7,
      -2.2175964844211e-7
    ];

    var G = [0, 0];
    for (i = G0.length; i--; ) {
      G = complexAdd([G0[i], 0], complexMul(G, y));
    }

    k = complexSub([w1, 0], complexMul(complexPow(y, 1 / 2), G));
    k = complexMul(k, rot);
    k = complexMul(k, rot);
  }

  if (n < 0.5) {
    // if |z| < 0.3
    // https://www.wolframalpha.com/input/?i=series+of+((1-z%5E3))+%5E+(-1%2F2)+at+z%3D0 (and ask for "more terms")
    // 1 + z^3/2 + (3 z^6)/8 + (5 z^9)/16 + (35 z^12)/128 + (63 z^15)/256 + (231 z^18)/1024 + O(z^21)
    // https://www.wolframalpha.com/input/?i=integral+of+1+%2B+z%5E3%2F2+%2B+(3+z%5E6)%2F8+%2B+(5+z%5E9)%2F16+%2B+(35+z%5E12)%2F128+%2B+(63+z%5E15)%2F256+%2B+(231+z%5E18)%2F1024
    // (231 z^19)/19456 + (63 z^16)/4096 + (35 z^13)/1664 + z^10/32 + (3 z^7)/56 + z^4/8 + z + constant
    var H0 = [1, 1 / 8, 3 / 56, 1 / 32, 35 / 1664, 63 / 4096, 231 / 19456];
    var z3 = complexPow(z, [3, 0]);
    for (i = H0.length; i--; ) {
      h = complexAdd([H0[i], 0], complexMul(h, z3));
    }
    h = complexMul(h, z);
  }

  if (n < 0.3) return h;
  if (n > 0.5) return k;

  // in between 0.3 and 0.5, interpolate
  var t = (n - 0.3) / (0.5 - 0.3);
  return complexAdd(complexMul(k, [t, 0]), complexMul(h, [1 - t, 0]));
}

var asin1_3 = asin(1 / 3);
var centers = [
  [0, 90],
  [-180, -asin1_3 * degrees],
  [-60, -asin1_3 * degrees],
  [60, -asin1_3 * degrees]
];
var tetrahedron = [[1, 2, 3], [0, 2, 1], [0, 3, 2], [0, 1, 3]].map(function(
  face
) {
  return face.map(function(i) {
    return centers[i];
  });
});

export default function() {
  var faceProjection = function(face) {
    var c = geoCentroid({ type: "MultiPoint", coordinates: face }),
      rotate = [-c[0], -c[1], 30];
    if (abs(c[1]) == 90) {
      rotate = [0, -c[1], -30];
    }
    return projection(leeRaw)
      .scale(1)
      .translate([0, 0])
      .rotate(rotate);
  };

  var faces = tetrahedron.map(function(face) {
    return { face: face, project: faceProjection(face) };
  });

  [-1, 0, 0, 0].forEach(function(d, i) {
    var node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  var p = polyhedral(
    faces[0],
    function(lambda, phi) {
      lambda *= degrees;
      phi *= degrees;
      for (var i = 0; i < faces.length; i++) {
        if (
          geoContains(
            {
              type: "Polygon",
              coordinates: [
                [
                  tetrahedron[i][0],
                  tetrahedron[i][1],
                  tetrahedron[i][2],
                  tetrahedron[i][0]
                ]
              ]
            },
            [lambda, phi]
          )
        ) {
          return faces[i];
        }
      }
    }
  );

  return p
    .rotate([30, 180]) // North Pole aspect, needs clipPolygon
    // .rotate([-30, 0]) // South Pole aspect
    .angle(-30)
    .scale(118.662)
    .translate([480, 195.47]);
}
