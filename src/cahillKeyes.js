/*
 * Cahill-Keyes projection
 *
 * Implemented in Perl by Mary Jo Graça (2011)
 *
 * Ported to D3.js by Enrico Spinielli (2013)
 *
 */
import { abs, cos, degrees, pi, radians, sin, sign, sqrt, tan } from "./math.js";
import { cartesianCross, cartesianDegrees, cartesianDot, sphericalDegrees } from "./cartesian.js";
import polyhedral from "./polyhedral/index.js";
import { geoProjectionMutator as projectionMutator } from "d3-geo";
import {solve2d} from "./newton.js";

export default function(faceProjection) {
  faceProjection =
    faceProjection ||
    (() => cahillKeyesProjection().scale(1));

  const octa = [[0, 90], [-90, 0], [0, 0], [90, 0], [180, 0], [0, -90]];

  const octahedron = [
    [0, 2, 1],
    [0, 3, 2],
    [5, 1, 2],
    [5, 2, 3],
    [0, 1, 4],
    [0, 4, 3],
    [5, 4, 1],
    [5, 3, 4]
  ].map((face) => face.map((i) => octa[i]));

  const ck = octahedron.map((face) => {
    const xyz = face.map(cartesianDegrees),
      n = xyz.length,
      theta = 17 * radians,
      cosTheta = cos(theta),
      sinTheta = sin(theta),
      hexagon = [];
    let a = xyz[n - 1];
    let b;
    for (let i = 0; i < n; ++i) {
      b = xyz[i];
      hexagon.push(
        sphericalDegrees([
          a[0] * cosTheta + b[0] * sinTheta,
          a[1] * cosTheta + b[1] * sinTheta,
          a[2] * cosTheta + b[2] * sinTheta
        ]),
        sphericalDegrees([
          b[0] * cosTheta + a[0] * sinTheta,
          b[1] * cosTheta + a[1] * sinTheta,
          b[2] * cosTheta + a[2] * sinTheta
        ])
      );
      a = b;
    }
    return hexagon;
  });

  const cornerNormals = [];

  const parents = [-1, 3, 0, 2, 0, 1, 4, 5];

  ck.forEach((hexagon, j) => {
    const face = octahedron[j],
      n = face.length,
      normals = (cornerNormals[j] = []);
    for (let i = 0; i < n; ++i) {
      ck.push([
        face[i],
        hexagon[(i * 2 + 2) % (2 * n)],
        hexagon[(i * 2 + 1) % (2 * n)]
      ]);
      parents.push(j);
      normals.push(
        cartesianCross(
          cartesianDegrees(hexagon[(i * 2 + 2) % (2 * n)]),
          cartesianDegrees(hexagon[(i * 2 + 1) % (2 * n)])
        )
      );
    }
  });

  const faces = ck.map((face) => ({project: faceProjection(face), face}));

  parents.forEach((d, i) => {
    const parent = faces[d];
    parent && (parent.children || (parent.children = [])).push(faces[i]);
  });
  return polyhedral(faces[0], face, 0, true)
    .scale(0.023975)
    .rotate([20, 0])
    .center([0,-17]);

  function face(lambda, phi) {
    const cosPhi = cos(phi);
    const p = [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];

    const hexagon =
      lambda < -pi / 2
        ? phi < 0 ? 6 : 4
        : lambda < 0
          ? phi < 0 ? 2 : 0
          : lambda < pi / 2 ? (phi < 0 ? 3 : 1) : phi < 0 ? 7 : 5;

    const n = cornerNormals[hexagon];

    return faces[
      cartesianDot(n[0], p) < 0
        ? 8 + 3 * hexagon
        : cartesianDot(n[1], p) < 0
          ? 8 + 3 * hexagon + 1
          : cartesianDot(n[2], p) < 0 ? 8 + 3 * hexagon + 2 : hexagon
    ];
  }
}

// all names of reference points, A, B, D, ... , G, P75
// or zones, A-L, are detailed fully in Gene Keyes'
// web site http://www.genekeyes.com/CKOG-OOo/7-CKOG-illus-&-coastline.html

export function cahillKeyesRaw(mg) {
  const CK = {
    lengthMG: mg // magic scaling length
  };

  preliminaries();

  function preliminaries() {
    let pointN, lengthMB, lengthMN, lengthNG, pointU;
    let m = 29, // meridian
      p = 15, // parallel
      p73a,
      lF,
      lT,
      lM,
      l,
      pointV,
      k = sqrt(3);

    CK.lengthMA = 940 / 10000 * CK.lengthMG;
    CK.lengthParallel0to73At0 = CK.lengthMG / 100;
    CK.lengthParallel73to90At0 =
      (CK.lengthMG - CK.lengthMA - CK.lengthParallel0to73At0 * 73) / (90 - 73);
    CK.sin60 = k / 2; // √3/2 
    CK.cos60 = 0.5;
    CK.pointM = [0, 0];
    CK.pointG = [CK.lengthMG, 0];
    pointN = [CK.lengthMG, CK.lengthMG * tan(30 * radians)];
    CK.pointA = [CK.lengthMA, 0];
    CK.pointB = lineIntersection(CK.pointM, 30, CK.pointA, 45);
    CK.lengthAG = distance(CK.pointA, CK.pointG);
    CK.lengthAB = distance(CK.pointA, CK.pointB);
    lengthMB = distance(CK.pointM, CK.pointB);
    lengthMN = distance(CK.pointM, pointN);
    lengthNG = distance(pointN, CK.pointG);
    CK.pointD = interpolate(lengthMB, lengthMN, pointN, CK.pointM);
    CK.pointF = [CK.lengthMG, lengthNG - lengthMB];
    CK.pointE = [
      pointN[0] - CK.lengthMA * sin(30 * radians),
      pointN[1] - CK.lengthMA * cos(30 * radians)
    ];
    CK.lengthGF = distance(CK.pointG, CK.pointF);
    CK.lengthBD = distance(CK.pointB, CK.pointD);
    CK.lengthBDE = CK.lengthBD + CK.lengthAB; // lengthAB = lengthDE 
    CK.lengthGFE = CK.lengthGF + CK.lengthAB; // lengthAB = lengthFE 
    CK.deltaMEq = CK.lengthGFE / 45;
    CK.lengthAP75 = (90 - 75) * CK.lengthParallel73to90At0;
    CK.lengthAP73 = CK.lengthMG - CK.lengthMA - CK.lengthParallel0to73At0 * 73;
    pointU = [
      CK.pointA[0] + CK.lengthAP73 * cos(30 * radians),
      CK.pointA[1] + CK.lengthAP73 * sin(30 * radians)
    ];
    CK.pointT = lineIntersection(pointU, -60, CK.pointB, 30);

    p73a = parallel73(m);
    lF = p73a.lengthParallel73;
    lT = lengthTorridSegment(m);
    lM = lengthMiddleSegment(m);
    l = p * (lT + lM + lF) / 73;
    pointV = [0, 0];
    CK.pointC = [0, 0];
    CK.radius = 0;

    l = l - lT;
    pointV = interpolate(l, lM, jointT(m), jointF(m));
    CK.pointC[1] =
      (pointV[0] * pointV[0] +
        pointV[1] * pointV[1] -
        CK.pointD[0] * CK.pointD[0] -
        CK.pointD[1] * CK.pointD[1]) /
      (2 * (k * pointV[0] + pointV[1] - k * CK.pointD[0] - CK.pointD[1]));
    CK.pointC[0] = k * CK.pointC[1];
    CK.radius = distance(CK.pointC, CK.pointD);

    return CK;
  }

  //**** helper functions ****//

  // distance between two 2D coordinates

  function distance(p1, p2) {
    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
  }

  // return 2D point at position length/totallength of the line
  // defined by two 2D points, start and end.

  function interpolate(length, totalLength, start, end) {
    return [
      start[0] + (end[0] - start[0]) * length / totalLength,
      start[1] + (end[1] - start[1]) * length / totalLength
    ];
  }

  // return the 2D point intersection between two lines defined
  // by one 2D point and a slope each.

  function lineIntersection(point1, slope1, point2, slope2) {
    // s1/s2 = slope in degrees
    const m1 = tan(slope1 * radians);
    const m2 = tan(slope2 * radians);
    const x = (m1 * point1[0] - m2 * point2[0] - point1[1] + point2[1]) / (m1 - m2);
    return [x, m1 * (x - point1[0]) + point1[1]];
  }

  // return the 2D point intercepting a circumference centered
  // at cc and of radius rn and a line defined by 2 points, p1 and p2:
  // First element of the returned array is a flag to state whether there is
  // an intersection, a value of zero (0) means NO INTERSECTION.
  // The following array is the 2D point of the intersection.
  // Equations from "Intersection of a Line and a Sphere (or circle)/Line Segment"
  // at http://paulbourke.net/geometry/circlesphere/
  function circleLineIntersection(cc, r, p1, p2) {
    let x1 = p1[0],
      y1 = p1[1],
      x2 = p2[0],
      y2 = p2[1],
      xc = cc[0],
      yc = cc[1],
      a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
      b = 2 * ((x2 - x1) * (x1 - xc) + (y2 - y1) * (y1 - yc)),
      c =
        xc * xc + yc * yc + x1 * x1 + y1 * y1 - 2 * (xc * x1 + yc * y1) - r * r,
      d = b * b - 4 * a * c,
      u1 = 0,
      u2 = 0,
      x = 0,
      y = 0;
    if (a === 0) {
      return [0, [0, 0]];
    } else if (d < 0) {
      return [0, [0, 0]];
    }
    u1 = (-b + sqrt(d)) / (2 * a);
    u2 = (-b - sqrt(d)) / (2 * a);
    if (0 <= u1 && u1 <= 1) {
      x = x1 + u1 * (x2 - x1);
      y = y1 + u1 * (y2 - y1);
      return [1, [x, y]];
    } else if (0 <= u2 && u2 <= 1) {
      x = x1 + u2 * (x2 - x1);
      y = y1 + u2 * (y2 - y1);
      return [1, [x, y]];
    } else {
      return [0, [0, 0]];
    }
  }

  // counterclockwise rotate 2D vector, xy, by angle (in degrees)
  // [original CKOG uses clockwise rotation]

  function rotate(xy, angle) {
    const xynew = [0, 0];

    if (angle === -60) {
      xynew[0] = xy[0] * CK.cos60 + xy[1] * CK.sin60;
      xynew[1] = -xy[0] * CK.sin60 + xy[1] * CK.cos60;
    } else if (angle === -120) {
      xynew[0] = -xy[0] * CK.cos60 + xy[1] * CK.sin60;
      xynew[1] = -xy[0] * CK.sin60 - xy[1] * CK.cos60;
    } else {
      // !!!!! This should not happen for this projection!!!!
      // the general algorithm: cos(angle) * xy + sin(angle) * perpendicular(xy)
      // return cos(angle * radians) * xy + sin(angle * radians) * perpendicular(xy);
      //console.log("rotate: angle " + angle + " different than -60 or -120!");
      // counterclockwise
      xynew[0] = xy[0] * cos(angle * radians) - xy[1] * sin(angle * radians);
      xynew[1] = xy[0] * sin(angle * radians) + xy[1] * cos(angle * radians);
    }

    return xynew;
  }

  // truncate towards zero like int() in Perl
  function truncate(n) {
    return Math[n > 0 ? "floor" : "ceil"](n);
  }

  function equator(m) {
    const l = CK.deltaMEq * m;
    return (l <= CK.lengthGF)
      ? [CK.pointG[0], l]
      : interpolate(l - CK.lengthGF, CK.lengthAB, CK.pointF, CK.pointE);
  }

  function jointE(m) {
    return equator(m);
  }

  function jointT(m) {
    return lineIntersection(CK.pointM, 2 * m / 3, jointE(m), m / 3);
  }

  function jointF(m) {
    if (m === 0) {
      return [CK.pointA + CK.lengthAB, 0];
    }
    return lineIntersection(CK.pointA, m, CK.pointM, 2 * m / 3);
  }

  function lengthTorridSegment(m) {
    return distance(jointE(m), jointT(m));
  }

  function lengthMiddleSegment(m) {
    return distance(jointT(m), jointF(m));
  }

  function parallel73(m) {
    let p73 = [0, 0],
      jF = jointF(m),
      lF = 0,
      xy = [0, 0];
    if (m <= 30) {
      p73[0] = CK.pointA[0] + CK.lengthAP73 * cos(m * radians);
      p73[1] = CK.pointA[1] + CK.lengthAP73 * sin(m * radians);
      lF = distance(jF, p73);
    } else {
      p73 = lineIntersection(CK.pointT, -60, jF, m);
      lF = distance(jF, p73);
      if (m > 44) {
        xy = lineIntersection(CK.pointT, -60, jF, 2 / 3 * m);
        if (xy[0] > p73[0]) {
          p73 = xy;
          lF = -distance(jF, p73);
        }
      }
    }
    return {
      parallel73: p73,
      lengthParallel73: lF
    };
  }

  function parallel75(m) {
    return [
      CK.pointA[0] + CK.lengthAP75 * cos(m * radians),
      CK.pointA[1] + CK.lengthAP75 * sin(m * radians)
    ];
  }

  // special functions to transform lon/lat to x/y
  function ll2mp(lon, lat) {
    const south = [0, 6, 7, 8, 5];
    let o = truncate((lon + 180) / 90 + 1);
    let m = (lon + 720) % 90 - 45; // meridian

    const s = sign(m);
    m = abs(m);
    if (o === 5) o = 1;
    if (lat < 0) o = south[o];
    return [m, abs(lat), s, o];
  }

  function zoneA(m, p) {
    return [CK.pointA[0] + (90 - p) * 104, 0];
  }

  function zoneB(m, p) {
    return [CK.pointG[0] - p * 100, 0];
  }

  function zoneC(m, p) {
    const l = 104 * (90 - p);
    return [
      CK.pointA[0] + l * cos(m * radians),
      CK.pointA[1] + l * sin(m * radians)
    ];
  }

  function zoneD(m /*, p */) {
    // p = p; // just keep it for symmetry in signature
    return equator(m);
  }

  function zoneE(m, p) {
    const l = 1560 + (75 - p) * 100;
    return [
      CK.pointA[0] + l * cos(m * radians),
      CK.pointA[1] + l * sin(m * radians)
    ];
  }

  function zoneF(m, p) {
    return interpolate(p, 15, CK.pointE, CK.pointD);
  }

  function zoneG(m, p) {
    const l = p - 15;
    return interpolate(l, 58, CK.pointD, CK.pointT);
  }

  function zoneH(m, p) {
    const p75 = parallel75(45),
      p73a = parallel73(m),
      p73 = p73a.parallel73,
      lF = distance(CK.pointT, CK.pointB),
      lF75 = distance(CK.pointB, p75),
      l = (75 - p) * (lF75 + lF) / 2;
    return (l <= lF75)
      ? interpolate(l, lF75, p75, CK.pointB)
      : interpolate(l - lF75, lF, CK.pointB, p73);
  }

  function zoneI(m, p) {
    const p73a = parallel73(m),
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m),
      l = p * (lT + lM + p73a.lengthParallel73) / 73;
    return (l <= lT)
      ? interpolate(l, lT, jointE(m), jointT(m))
      : (l <= lT + lM)
        ? interpolate(l - lT, lM, jointT(m), jointF(m))
        : interpolate(l - lT - lM, p73a.lengthParallel73, jointF(m), p73a.parallel73);
  }

  function zoneJ(m, p) {
    const p75 = parallel75(m),
      lF75 = distance(jointF(m), p75),
      p73a = parallel73(m),
      p73 = p73a.parallel73,
      lF = p73a.lengthParallel73,
      l = (75 - p) * (lF75 - lF) / 2;

    return (l <= lF75)
      ? interpolate(l, lF75, p75, jointF(m))
      : interpolate(l - lF75, -lF, jointF(m), p73);
  }

  function zoneK(m, p, l15) {
    const l = p * l15 / 15,
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m);
    return (l <= lT) 
      // point is in torrid segment
      ? interpolate(l, lT, jointE(m), jointT(m))
      // point is in middle segment
      : interpolate(l - lT, lM, jointT(m), jointF(m));
  }

  function zoneL(m, p, l15) {
    const p73a = parallel73(m),
      p73 = p73a.parallel73,
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m),
      lF = p73a.lengthParallel73,
      l = l15 + (p - 15) * (lT + lM + lF - l15) / 58;
    return (l <= lT)
      // on torrid segment
      ? interpolate(l, lT, jointE(m), jointF(m))
      : (l <= lT + lM)
        // on middle segment
        ? interpolate(l - lT, lM, jointT(m), jointF(m))
        // on frigid segment
        : interpolate(l - lT - lM, lF, jointF(m), p73);
  }

  // convert half-octant meridian,parallel to x,y coordinates.
  // arguments are meridian, parallel

  function mp2xy(m, p) {
    // zones (a) and (b)
    if (m === 0) return (p >= 75) ? zoneA(m, p) : zoneB(m, p);
    else if (p >= 75) return zoneC(m, p);
    else if (p === 0) return zoneD(m, p);
    else if (p >= 73 && m <= 30) return zoneE(m, p);
    else if (m === 45) return (p <= 15) ? zoneF(m, p) : (p <= 73) ? zoneG(m, p) : zoneH(m, p);
    else {
      if (m <= 29) return zoneI(m, p);
      else {
        // supple zones (j), (k) and (l)
        if (p >= 73) return zoneJ(m, p);
        else {
          const lT = lengthTorridSegment(m);
          let l15;
    
          //zones (k) and (l)
          let p15a = circleLineIntersection(
            CK.pointC,
            CK.radius,
            jointT(m),
            jointF(m)
          );
          let flag15 = p15a[0];
          let p15 = p15a[1];
          if (flag15 === 1) {
            // intersection is in middle segment
            l15 = lT + distance(jointT(m), p15);
          } else {
            // intersection is in torrid segment
            p15a = circleLineIntersection(
              CK.pointC,
              CK.radius,
              jointE(m),
              jointT(m)
            );
            flag15 = p15a[0];
            p15 = p15a[1];
            if (flag15 === 0) {
              //console.log("Something weird!");
              // TODO: Trap this! Something odd happened!
            }
            l15 = lT - distance(jointT(m), p15);
          }
          return (p <= 15) ? zoneK(m, p, l15) : zoneL(m, p, l15);
        }
      }
    }
  }

  // from half-octant to megamap (single rotated octant)

  function mj2g(xy, octant) {
    let xynew;

    if (octant === 0) {
      xynew = rotate(xy, -60);
    } else if (octant === 1) {
      xynew = rotate(xy, -120);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 2) {
      xynew = rotate(xy, -60);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 3) {
      xynew = rotate(xy, -120);
      xynew[0] += CK.lengthMG;
    } else if (octant === 4) {
      xynew = rotate(xy, -60);
      xynew[0] += CK.lengthMG;
    } else if (octant === 5) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -60);
      xynew[0] += CK.lengthMG;
    } else if (octant === 6) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -120);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 7) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -60);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 8) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -120);
      xynew[0] += CK.lengthMG;
    }
    return xynew;
  }

  // general CK map projection

  function forward(lambda, phi) {
    // lambda, phi are in radians.
    const lon = lambda * degrees,
      lat = phi * degrees,
      res = ll2mp(lon, lat),
      m = res[0],  // 0 ≤ m ≤ 45
      p = res[1],  // 0 ≤ p ≤ 90
      s = res[2],  // -1 / 1 = side of m
      o = res[3],  // octant
      xy = mp2xy(m, p);
    return mj2g([xy[0], s * xy[1]], o);
  }

  forward.invert = solve2d(forward);

  return forward;
}

function cahillKeyesProjection() {
  const mg = 10000;
  const m = projectionMutator(cahillKeyesRaw);
  return m(mg);
}
