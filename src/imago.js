/*
 * Imago projection, by Justin Kunimune
 *
 * Inspired by Hajime Narukawa’s AuthaGraph
 *
 */
import {
  abs,
  acos,
  asin,
  atan,
  atan2,
  cos,
  degrees,
  epsilon,
  floor,
  halfPi,
  pi,
  pow,
  sign,
  sin,
  sqrt,
  tan
} from "./math";
import { geoProjectionMutator as projectionMutator } from "d3-geo";
import { default as clipPolygon } from "./clip/polygon";
import { solve } from "./newton.js";

var hypot = Math.hypot;

var ASIN_ONE_THD = asin(1 / 3),
  centrums = [
    [halfPi, 0, 0, -halfPi, 0, sqrt(3)],
    [-ASIN_ONE_THD, 0, pi, halfPi, 0, -sqrt(3)],
    [-ASIN_ONE_THD, (2 * pi) / 3, pi, (5 * pi) / 6, 3, 0],
    [-ASIN_ONE_THD, (-2 * pi) / 3, pi, pi / 6, -3, 0]
  ],
  TETRAHEDRON_WIDE_VERTEX = {
    sphereSym: 3,
    planarSym: 6,
    width: 6,
    height: 2 * sqrt(3),
    centrums,
    rotateOOB: function(x, y, xCen, yCen) {
      yCen * 0;
      if (abs(x) > this.width / 2) return [2 * xCen - x, -y];
      else return [-x, this.height * sign(y) - y];
    },
    inBounds: () => true
  },
  configuration = TETRAHEDRON_WIDE_VERTEX;

export function imagoRaw(k) {
  function faceProject(lon, lat) {
    const tht = atan(((lon - asin(sin(lon) / sqrt(3))) / pi) * sqrt(12)),
      p = (halfPi - lat) / atan(sqrt(2) / cos(lon));

    return [(pow(p, k) * sqrt(3)) / cos(tht), tht];
  }

  function faceInverse(r, th) {
    const l = solve(
        l => atan(((l - asin(sin(l) / sqrt(3))) / pi) * sqrt(12)),
        th,
        th / 2
      ),
      R = r / (sqrt(3) / cos(th));
    return [halfPi - pow(R, 1 / k) * atan(sqrt(2) / cos(l)), l];
  }

  function obliquifySphc(latF, lonF, pole) {
    if (pole == null)
      // null pole indicates that this procedure should be bypassed
      return [latF, lonF];

    const lat0 = pole[0],
      lon0 = pole[1],
      tht0 = pole[2];

    let lat1, lon1;
    if (lat0 == halfPi) lat1 = latF;
    else
      lat1 = asin(
        sin(lat0) * sin(latF) + cos(lat0) * cos(latF) * cos(lon0 - lonF)
      ); // relative latitude

    if (lat0 == halfPi)
      // accounts for all the 0/0 errors at the poles
      lon1 = lonF - lon0;
    else if (lat0 == -halfPi) lon1 = lon0 - lonF - pi;
    else {
      lon1 =
        acos(
          (cos(lat0) * sin(latF) - sin(lat0) * cos(latF) * cos(lon0 - lonF)) /
            cos(lat1)
        ) - pi; // relative longitude
      if (isNaN(lon1)) {
        if (
          (cos(lon0 - lonF) >= 0 && latF < lat0) ||
          (cos(lon0 - lonF) < 0 && latF < -lat0)
        )
          lon1 = 0;
        else lon1 = -pi;
      } else if (sin(lonF - lon0) > 0)
        // it's a plus-or-minus arccos.
        lon1 = -lon1;
    }
    lon1 = lon1 - tht0;

    return [lat1, lon1];
  }

  function obliquifyPlnr(coords, pole) {
    if (pole == null)
      //this indicates that you just shouldn't do this calculation
      return coords;

    let lat1 = coords[0],
      lon1 = coords[1];
    const lat0 = pole[0],
      lon0 = pole[1],
      tht0 = pole[2];

    lon1 += tht0;
    let latf = asin(sin(lat0) * sin(lat1) - cos(lat0) * cos(lon1) * cos(lat1)),
      lonf,
      innerFunc = sin(lat1) / cos(lat0) / cos(latf) - tan(lat0) * tan(latf);
    if (lat0 == halfPi)
      // accounts for special case when lat0 = pi/2
      lonf = lon1 + lon0;
    else if (lat0 == -halfPi)
      // accounts for special case when lat0 = -pi/2
      lonf = -lon1 + lon0 + pi;
    else if (abs(innerFunc) > 1) {
      // accounts for special case when cos(lat1) -> 0
      if ((lon1 == 0 && lat1 < -lat0) || (lon1 != 0 && lat1 < lat0))
        lonf = lon0 + pi;
      else lonf = lon0;
    } else if (sin(lon1) > 0) lonf = lon0 + acos(innerFunc);
    else lonf = lon0 - acos(innerFunc);

    let thtf = pole[2];

    return [latf, lonf, thtf];
  }

  function forward(lon, lat) {
    const width = configuration.width,
      height = configuration.height;
    const numSym = configuration.sphereSym; //we're about to be using this variable a lot
    let latR = -Infinity;
    let lonR = -Infinity;
    let centrum = null;
    for (const testCentrum of centrums) {
      //iterate through the centrums to see which goes here
      const relCoords = obliquifySphc(lat, lon, testCentrum);
      if (relCoords[0] > latR) {
        latR = relCoords[0];
        lonR = relCoords[1];
        centrum = testCentrum;
      }
    }

    const lonR0 =
      floor((lonR + pi / numSym) / ((2 * pi) / numSym)) * ((2 * pi) / numSym);

    const rth = faceProject(lonR - lonR0, latR);
    const r = rth[0];
    const th = rth[1] + centrum[3] + (lonR0 * numSym) / configuration.planarSym;
    const x0 = centrum[4];
    const y0 = centrum[5];

    let output = [r * cos(th) + x0, r * sin(th) + y0];
    if (abs(output[0]) > width / 2 || abs(output[1]) > height / 2) {
      output = configuration.rotateOOB(output[0], output[1], x0, y0);
    }
    return output;
  }

  function invert(x, y) {
    if (isNaN(x) || isNaN(y)) return null;

    if (!configuration.inBounds(x, y)) return null;

    const numSym = configuration.planarSym;

    let rM = +Infinity;
    let centrum = null; //iterate to see which centrum we get
    for (const testCentrum of centrums) {
      const rR = hypot(x - testCentrum[4], y - testCentrum[5]);
      if (rR < rM) {
        //pick the centrum that minimises r
        rM = rR;
        centrum = testCentrum;
      }
    }
    const th0 = centrum[3],
      x0 = centrum[4],
      y0 = centrum[5],
      r = hypot(x - x0, y - y0),
      th = atan2(y - y0, x - x0) - th0,
      thBase =
        floor((th + pi / numSym) / ((2 * pi) / numSym)) * ((2 * pi) / numSym);

    let relCoords = faceInverse(r, th - thBase);

    if (relCoords == null) return null;

    relCoords[1] = (thBase * numSym) / configuration.sphereSym + relCoords[1];
    let absCoords = obliquifyPlnr(relCoords, centrum);
    return [absCoords[1], absCoords[0]];
  }

  forward.invert = invert;

  return forward;
}

export function imagoBlock() {
  var k = 0.68,
    m = projectionMutator(imagoRaw),
    p = m(k);

  p.k = function(_) {
    return arguments.length ? m((k = +_)) : k;
  };

  var a = -atan(1 / sqrt(2)) * degrees,
    poly = {
      type: "Polygon",
      coordinates: [
        [
          [-180 + epsilon, a + epsilon],
          [0, 90],
          [180 - epsilon, a + epsilon],
          [180 - epsilon, a - epsilon],
          [-180 + epsilon, a - epsilon],
          [-180 + epsilon, a + epsilon]
        ]
      ]
    };

  return p
    .preclip(clipPolygon(poly))
    .scale(144.04)
    .rotate([18, -12.5, 3.5])
    .center([0, 35.2644]);
}

function imagoWideRaw(k, shift) {
  var imago = imagoRaw(k);
  const height = configuration.height;

  function forward(lon, lat) {
    const p = imago(lon, lat),
      q = [p[1], -p[0]];

    if (q[1] > 0) {
      q[0] = height - q[0];
      q[1] *= -1;
    }

    q[0] += shift;
    if (q[0] < 0) q[0] += height * 2;

    return q;
  }

  function invert(x, y) {
    x = (x - shift) / height;

    if (x > 1.5) {
      x -= 2;
    }

    if (x > 0.5) {
      x = 1 - x;
      y *= -1;
    }

    return imago.invert(-y, x * height);
  }

  forward.invert = invert;
  return forward;
}

export default function() {
  var k = 0.68,
    shift = 1.16,
    m = projectionMutator(imagoWideRaw),
    p = m(k, shift);

  p.shift = function(_) {
    return arguments.length ? clipped(m(k, (shift = +_))) : shift;
  };
  p.k = function(_) {
    return arguments.length ? clipped(m((k = +_), shift)) : k;
  };

  function clipped(p) {
    const N = 50 + 2 * epsilon,
      border = [],
      e = 4e-3;

    const scale = p.scale(),
      center = p.center(),
      translate = p.translate(),
      rotate = p.rotate();
    p.scale(1)
      .center([0, 90])
      .rotate([0, 0])
      .translate([shift, 0]);
    for (let i = N - epsilon; i > 0; i--) {
      border.unshift(
        p.invert([
          1.5 * configuration.height - e,
          ((configuration.width / 2) * i) / N
        ])
      );
      border.push(
        p.invert([
          -0.5 * configuration.height + e,
          ((configuration.width / 2) * i) / N
        ])
      );
    }
    border.push(border[0]);

    return p
      .scale(scale)
      .center(center)
      .translate(translate)
      .rotate(rotate)
      .preclip(
        clipPolygon({
          type: "Polygon",
          coordinates: [border]
        })
      );
  }

  return clipped(p)
    .rotate([18, -12.5, 3.5])
    .scale(138.42)
    .translate([480, 250])
    .center([-139.405, 40.5844]);
}
