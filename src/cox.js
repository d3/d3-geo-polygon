import { geoProjection as projection, geoStream } from "d3-geo";
import { scan } from "d3-array";
import { asin, degrees, epsilon, sqrt } from "./math";
import { geoLagrangeRaw as lagrangeRaw } from "d3-geo-projection";
import { complexAdd, complexMul, complexNorm2, complexPow } from "./complex";

// w1 = gamma(1/n) * gamma(1 - 2/n) / n / gamma(1 - 1/n)
// https://bl.ocks.org/Fil/852557838117687bbd985e4b38ff77d4
var w = [-1 / 2, sqrt(3) / 2],
  w1 = [1.7666387502854533, 0],
  m = 0.3 * 0.3;

// Approximate \int _0 ^sm(z)  dt / (1 - t^3)^(2/3)
// sm maps a triangle to a disc, sm^-1 does the opposite
function sm_1(z) {
  var k = [0, 0];

  // rotate to have s ~= 1
  var rot = complexPow(
    w,
    scan(
      [0, 1, 2].map(function(i) {
        return -complexMul(z, complexPow(w, [i, 0]))[0];
      })
    )
  );

  var y = complexMul(rot, z);
  y = [1 - y[0], -y[1]];

  // McIlroy formula 5 p6 and table for F3 page 16
  var F0 = [
    1.44224957030741,
    0.240374928384568,
    0.0686785509670194,
    0.0178055502507087,
    0.00228276285265497,
    -1.48379585422573e-3,
    -1.64287728109203e-3,
    -1.02583417082273e-3,
    -4.83607537673571e-4,
    -1.67030822094781e-4,
    -2.45024395166263e-5,
    2.14092375450951e-5,
    2.55897270486771e-5,
    1.73086854400834e-5,
    8.72756299984649e-6,
    3.18304486798473e-6,
    4.79323894565283e-7 - 4.58968389565456e-7,
    -5.62970586787826e-7,
    -3.92135372833465e-7
  ];

  var F = [0, 0];
  for (var i = F0.length; i--; ) F = complexAdd([F0[i], 0], complexMul(F, y));

  k = complexMul(
    complexAdd(w1, complexMul([-F[0], -F[1]], complexPow(y, 1 - 2 / 3))),
    complexMul(rot, rot)
  );

  // when we are close to [0,0] we switch to another approximation:
  // https://www.wolframalpha.com/input/?i=(-2%2F3+choose+k)++*+(-1)%5Ek++%2F+(k%2B1)+with+k%3D0,1,2,3,4
  // the difference is _very_ tiny but necessary
  // if we want projection(0,0) === [0,0]
  var n = complexNorm2(z);
  if (n < m) {
    var H0 = [
      1,
      1 / 3,
      5 / 27,
      10 / 81,
      22 / 243 //…
    ];
    var z3 = complexPow(z, [3, 0]);
    var h = [0, 0];
    for (i = H0.length; i--; ) h = complexAdd([H0[i], 0], complexMul(h, z3));
    h = complexMul(h, z);
    k = complexAdd(complexMul(k, [n / m, 0]), complexMul(h, [1 - n / m, 0]));
  }

  return k;
}

var lagrange1_2 = lagrangeRaw(0.5);
export function coxRaw(lambda, phi) {
  var s = lagrange1_2(lambda, phi);
  var t = sm_1([s[1] / 2, s[0] / 2]);
  return [t[1], t[0]];
}

// the Sphere should go *exactly* to the vertices of the triangles
// because they are singular points
function sphere() {
  var c = 2 * asin(1 / sqrt(5)) * degrees;
  return {
    type: "Polygon",
    coordinates: [
      [[0, 90], [-180, -c + epsilon], [0, -90], [180, -c + epsilon], [0, 90]]
    ]
  };
}

export default function() {
  var p = projection(coxRaw);

  var stream_ = p.stream;
  p.stream = function(stream) {
    var rotate = p.rotate(),
      rotateStream = stream_(stream),
      sphereStream = (p.rotate([0, 0]), stream_(stream));
    p.rotate(rotate);
    rotateStream.sphere = function() {
      geoStream(sphere(), sphereStream);
    };
    return rotateStream;
  };

  return p
    .scale(188.305)
    .translate([480, 333.167]);
}
