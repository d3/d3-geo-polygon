import clipBuffer from "./buffer.js";
import clipRejoin from "./rejoin.js";
import {geoContains} from "d3-geo";
import {abs, degrees, epsilon, halfPi, pi} from "../math.js";
import {merge} from "d3-array";

export default function(pointVisible, clipLine, interpolate, start, sort, {clipPoint = false} = {}) {
  if (typeof sort === "undefined") sort = compareIntersection;

  return function(sink) {
    const line = clipLine(sink);
    const ringBuffer = clipBuffer();
    const ringSink = clipLine(ringBuffer);
    let polygonStarted = false,
        polygon,
        segments,
        ring;

    const clip = {
      point,
      lineStart,
      lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = merge(segments);
        // the rings are in radians, and not closed
        const startInside = maybeInside(polygon, start)
          && geoContains({type: "Polygon", coordinates: polygon.map(ringDegrees)}, pointDegrees(start));
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, sort, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          interpolate(null, null, 1, sink);
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: () => interpolate(null, null, 1, sink)
    };

    function point(lambda, phi) {
      if ((!clipPoint && !ring) || pointVisible(lambda, phi)) sink.point(lambda, phi);
    }

    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi, close) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi, close);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1], true);
      ringSink.lineEnd();

      const clean = ringSink.clean();
      const ringSegments = ringBuffer.result();
      const n = ringSegments.length;
      let m, segment, point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (let i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
}

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}

// A clockwise (small) polygon whose edges cross neither the point’s longitude
// nor the antimeridian, nor touch a pole, cannot contain the point.
function maybeInside(polygon, [x]) {
  let area = 0;
  for (const ring of polygon) {
    let a = ring[ring.length - 1];
    for (const b of ring) {
      if ((a[0] - x) * (b[0] - x) <= 0 || abs(b[0] - a[0]) >= pi || abs(b[1]) === halfPi) return true;
      area += a[0] * b[1] - b[0] * a[1];
      a = b;
    }
  }
  return area >= 0;
}

function pointDegrees([x, y]) {
  return [x * degrees, y * degrees];
}

function ringDegrees(ring) {
  return [...ring, ring[0]].map(pointDegrees);
}
