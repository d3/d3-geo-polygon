import clip from "./index.js";
import {abs, atan2, cos, radians, sign, sin, sqrt} from "../math.js";
import {cartesian, cartesianCross, cartesianDot, cartesianNormalize, spherical} from "../cartesian.js";
import {intersectSegment} from "../intersect.js";
import {edgeOrVertexCrossing, equal, loopContains} from "../predicates.js";

const clipNone = (stream) => stream;

// clipPolygon
export default function (geometry) {
  let clipPoint = true;

  function clipGeometry(geometry) {
    if (geometry.type === "Polygon") geometry = {type: "MultiPolygon", coordinates: [geometry.coordinates]};
    if (geometry.type !== "MultiPolygon") return clipNone;
    const clips = geometry.coordinates.map((polygon) => {
      polygon = polygon.map(ringRadians);
      const segments = ringSegments(polygon[0]); // todo holes?
      // consistent with the crossings; the ring is clockwise
      const contains = loopContains(segments.map((s) => s.from).reverse());
      const pointVisible = (lambda, phi) => contains(cartesian([lambda, phi]));
      return clip(
        pointVisible,
        clipLine(segments, pointVisible),
        interpolate(segments, polygon),
        polygon[0][0],
        clipPolygonSort,
        {clipPoint}
      );
    });

    function clipPolygon(stream) {
      const clipstream = clips.map(clip => clip(stream));
      return {
        point(lambda, phi) {
          clipstream.forEach((clip) => clip.point(lambda, phi));
        },
        lineStart() {
          clipstream.forEach((clip) => clip.lineStart());
        },
        lineEnd() {
          clipstream.forEach((clip) => clip.lineEnd());
        },
        polygonStart() {
          clipstream.forEach((clip) => clip.polygonStart());
        },
        polygonEnd() {
          clipstream.forEach((clip) => clip.polygonEnd());
        },
        sphere() {
          clipstream.forEach((clip) => clip.sphere());
        },
      };
    }

    clipPolygon.polygon = (_) => _ !== undefined ? clipGeometry(geometry = _) : geometry;
    clipPolygon.clipPoint = (_) => _ !== undefined ? ((clipPoint = !!_), clipGeometry(geometry)) : clipPoint;

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
    if (i) segments.push(Object.assign(new intersectSegment(c0, c), {bound: bound(c0, c)}));
    c0 = c;
    return point;
  });
  return segments;
}

// The bounding sphere of the arc from a to b (unit vectors); its diameter is the chord [a, b].
function bound(a, b) {
  const u = b[0] - a[0], v = b[1] - a[1], w = b[2] - a[2];
  return {center: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], radius: sqrt(u * u + v * v + w * w) / 2};
}

// Can arcs with bounding spheres a and b touch?
function overlap(a, b) {
  const x = a.center[0] - b.center[0], y = a.center[1] - b.center[1], z = a.center[2] - b.center[2];
  const r = a.radius + b.radius + 1e-9;
  return x * x + y * y + z * z <= r * r;
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
        const segment =
          segments[
            (from.index + i * direction + segments.length) % segments.length
          ];
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

// Where segments a and b cross: a shared vertex, else the intersection of their
// great circles, else (if collinear) a point of their overlap.
function crossingPoint(a, b) {
  for (const p of [a.from, a.to]) if (equal(p, b.from) || equal(p, b.to)) return p.slice();
  const n = cartesianCross(a.normal, b.normal);
  if (cartesianDot(n, n) > 1e-24 * cartesianDot(a.normal, a.normal) * cartesianDot(b.normal, b.normal)) {
    const x = cartesianNormalize(n);
    return cartesianDot(x, a.from) + cartesianDot(x, a.to) < 0 ? x.map((d) => -d) : x;
  }
  // not s.l, which is inaccurate for short segments
  const on = (p, s) => clipPolygonDistance(s.from, p) + clipPolygonDistance(p, s.to) <= clipPolygonDistance(s.from, s.to) + 1e-12;
  for (const p of [b.from, b.to, a.from, a.to]) if (on(p, a) && on(p, b)) return p.slice();
  return a.to.slice();
}

function clipLine(segments, pointVisible) {
  return function (stream) {
    let point0, lambda00, phi00, v00, v0, clean, line, lines = [];
    return {
      lineStart() {
        point0 = null;
        clean = 1;
        line = [];
      },
      lineEnd() {
        if (v0) lines.push(line);
        lines.forEach((line) => {
          stream.lineStart();
          line.forEach((point) => stream.point(...point)); // can have 4 dimensions
          stream.lineEnd();
        });
        lines = [];
      },
      point(lambda, phi, close) {
        if (cos(lambda) == -1) lambda -= sign(sin(lambda)) * 1e-5; // move away from -180/180 https://github.com/d3/d3-geo/pull/108#issuecomment-323798937
        if (close) (lambda = lambda00), (phi = phi00);
        let point = cartesian([lambda, phi]);
        let v = v0;
        if (point0) {
          const intersections = [];
          const c = bound(point0, point);
          let segment;
          for (let i = 0; i < segments.length; ++i) {
            const s = segments[i];
            if (overlap(c, s.bound) && edgeOrVertexCrossing(point0, point, s.from, s.to)) {
              const intersection = crossingPoint(segment || (segment = new intersectSegment(point0, point)), s);
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
                const p = [intersection[0], intersection[1], intersection.index, intersection.t];
                // drop zero-length pieces (the line only touches the polygon)
                if (line.every((q) => abs(q[0] - p[0]) < 1e-12 && abs(q[1] - p[1]) < 1e-12)) continue;
                line.push(p);
                lines.push(line);
              }
            }
          }
          if (v) line.push([lambda, phi]);
        } else {
          v00 = v = pointVisible((lambda00 = lambda), (phi00 = phi));
          if (v) (line = []), line.push([lambda, phi]);
        }
        point0 = point;
        v0 = v;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean() {
        return clean | ((v00 && v0) << 1);
      }
    };
  };
}
