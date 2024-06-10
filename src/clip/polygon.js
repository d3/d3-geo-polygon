import clip from "./index.js";
import {atan2, cos, max, min, pi, radians, sign, sin, sqrt} from "../math.js";
import {cartesian, cartesianCross, cartesianDot, cartesianEqual, spherical} from "../cartesian.js";
import {intersectCoincident, intersectPointOnLine, intersectSegment, intersect} from "../intersect.js";
import {default as polygonContains} from "../polygonContains.js";

const clipNone = function(stream) { return stream; };

// clipPolygon
export default function(geometry) {
  function clipGeometry(geometry) {
    let polygons;

    if (geometry.type === "MultiPolygon") {
      polygons = geometry.coordinates;
    } else if (geometry.type === "Polygon") {
      polygons = [geometry.coordinates];
    } else {
      return clipNone;
    }

    const clips = polygons.map((polygon) => {
      polygon = polygon.map(ringRadians);
      const pointVisible = visible(polygon);
      const segments = ringSegments(polygon[0]); // todo holes?
      return clip(
        pointVisible,
        clipLine(segments, pointVisible),
        interpolate(segments, polygon),
        polygon[0][0],
        clipPolygonSort
      );
    });

    const clipPolygon = function(stream) {
      const clipstream = clips.map(clip => clip(stream));
      return {
        point: (lambda, phi) => {
          clipstream.forEach(clip => clip.point(lambda, phi));
        },
        lineStart: () => {
          clipstream.forEach(clip => clip.lineStart());
        },
        lineEnd: () => {
          clipstream.forEach(clip => clip.lineEnd());
        },
        polygonStart: () => {
          clipstream.forEach(clip => clip.polygonStart());
        },
        polygonEnd: () => {
          clipstream.forEach(clip => clip.polygonEnd());
        },
        sphere: () => {
          clipstream.forEach(clip => clip.sphere());
        }
      };
    };

    clipPolygon.polygon = function(_) {
      return _ ? ((geometry = _), clipGeometry(geometry)) : geometry;
    };
    return clipPolygon;
  }

  return clipGeometry(geometry);
}

function ringRadians(ring) {
  return ring.map((point) => [point[0] * radians, point[1] * radians]);
}

function ringSegments(ring) {
  const segments = [];
  let c0;
  ring.forEach((point, i) => {
    const c = cartesian(point);
    if (i) segments.push(new intersectSegment(c0, c));
    c0 = c;
    return point;
  });
  return segments;
}

function clipPolygonSort(a, b) {
  (a = a.x), (b = b.x);
  return a.index - b.index || a.t - b.t;
}

function interpolate(segments, polygon) {
  return (from, to, direction, stream) => {
    if (from == null) {
      stream.polygonStart();
      polygon.forEach((ring) => {
        stream.lineStart();
        ring.forEach((point) => stream.point(point[0], point[1]));
        stream.lineEnd();
      });
      stream.polygonEnd();
    } else if (
      from.index !== to.index &&
      from.index != null &&
      to.index != null
    ) {
      for (
        let i = from.index;
        i !== to.index;
        i = (i + direction + segments.length) % segments.length
      ) {
        const segment = segments[i];
        const point = spherical(direction > 0 ? segment.to : segment.from);
        stream.point(point[0], point[1]);
      }
    } else if (
      from.index === to.index &&
      from.t > to.t &&
      from.index != null &&
      to.index != null
    ) {
      for (let i = 0; i < segments.length; ++i) {
        const segment = segments[(from.index + i * direction + segments.length)%segments.length];
        const point = spherical(direction > 0 ? segment.to : segment.from);
        stream.point(point[0], point[1]);
      }
    }
  };
}

// Geodesic coordinates for two 3D points.
function clipPolygonDistance(a, b) {
  const axb = cartesianCross(a, b);
  return atan2(sqrt(cartesianDot(axb, axb)), cartesianDot(a, b));
}

function visible(polygon) {
  return (lambda, phi) => polygonContains(polygon, [lambda, phi]);
}

function randsign(i, j) {
  return sign(sin(100 * i + j));
}

function clipLine(segments, pointVisible) {
  return function(stream) {
    let point0, lambda00, phi00, v00, v0, clean, line, lines = [];
    return {
      lineStart: function() {
        point0 = null;
        clean = 1;
        line = [];
      },
      lineEnd: function() {
        if (v0) lines.push(line);
        lines.forEach((line) => {
          stream.lineStart();
          line.forEach((point) => stream.point(...point)); // can have 4 dimensions
          stream.lineEnd();
        });
        lines = [];
      },
      point: (lambda, phi, close) => {
        if (cos(lambda) == -1) lambda -= sign(sin(lambda)) * 1e-5; // move away from -180/180 https://github.com/d3/d3-geo/pull/108#issuecomment-323798937
        if (close) (lambda = lambda00), (phi = phi00);
        let point = cartesian([lambda * 0.9999999999, phi + 1e-14]);
        let v = v0;
        if (point0) {
          const intersections = [];
          let segment = new intersectSegment(point0, point);
          for (let i = 0, j = 100; i < segments.length && j > 0; ++i) {
            const s = segments[i];
            const intersection = intersect(segment, s);
            if (intersection) {
              if (
                intersection === intersectCoincident ||
                cartesianEqual(intersection, point0) ||
                cartesianEqual(intersection, point) ||
                cartesianEqual(intersection, s.from) ||
                cartesianEqual(intersection, s.to)
              ) {
                const t = 1e-4;
                lambda = ((lambda + 3 * pi + randsign(i, j) * t) % (2 * pi)) - pi;
                phi = min(pi / 2 - t, max(t - pi / 2, phi + randsign(i, j) * t));
                segment = new intersectSegment(point0, (point = cartesian([lambda, phi])));
                (i = -1), --j;
                intersections.length = 0;
                continue;
              }
              const sph = spherical(intersection);
              intersection.distance = clipPolygonDistance(point0, intersection);
              intersection.index = i;
              intersection.t = clipPolygonDistance(s.from, intersection);
              intersection[0] = sph[0];
              intersection[1] = sph[1];
              delete intersection[2];
              intersections.push(intersection);
            }
          }
          if (intersections.length) {
            clean = 0;
            intersections.sort((a, b) => a.distance - b.distance);
            for (let i = 0; i < intersections.length; ++i) {
              const intersection = intersections[i];
              v = !v;
              if (v) {
                line = [];
                line.push([
                  intersection[0],
                  intersection[1],
                  intersection.index,
                  intersection.t
                ]);
              } else {
                line.push([
                  intersection[0],
                  intersection[1],
                  intersection.index,
                  intersection.t
                ]);
                lines.push(line);
              }
            }
          }
          if (v) line.push([lambda, phi]);
        } else {
          for (let i = 0, j = 100; i < segments.length && j > 0; ++i) {
            const s = segments[i];
            if (intersectPointOnLine(point, s)) {
              const t = 1e-4;
              lambda = ((lambda + 3 * pi + randsign(i, j) * t) % (2 * pi)) - pi;
              phi = min(
                pi / 2 - 1e-4,
                max(1e-4 - pi / 2, phi + randsign(i, j) * t)
              );
              point = cartesian([lambda, phi]);
              (i = -1), --j;
            }
          }
          v00 = v = pointVisible((lambda00 = lambda), (phi00 = phi));
          if (v) line = [], line.push([lambda, phi]);
        }
        point0 = point;
        v0 = v;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: () => clean | ((v00 && v0) << 1)
    };
  };
}
