import assert from "node:assert";
import {it} from "vitest";
import { geoClipPolygon } from "d3-geo-polygon";
import { geoEquirectangular, geoPath } from "d3-geo";

it("clipPolygon clips line", () => {
  const clipPolygon = geoClipPolygon({
    type: "Polygon",
    coordinates: [
      [
        [-10, -10],
        [-10, 10],
        [10, 10],
        [10, -10],
        [-10, -10],
      ],
    ],
  });
  const projection = geoEquirectangular().clipAngle(10).preclip(clipPolygon);
  const path = geoPath().projection(projection);
  assert.deepStrictEqual(
    path({
      type: "LineString",
      coordinates: [
        [-20, 0],
        [20, 0],
      ],
    }),
    path({
      type: "LineString",
      coordinates: [
        [-10.5, 0],
        [10.5, 0],
      ],
    })
  );
});

it("clipPolygon interpolates when the intersections are on the same segment", function () {
  const clipPolygon = geoClipPolygon({
      type: "Polygon",
      coordinates: [
        [
          [-10, -11],
          [10, 10],
          [11, -10],
          [-10, -11],
        ],
      ],
    }),
    projection = geoEquirectangular().preclip(clipPolygon).precision(0.1),
    path = geoPath().projection(projection);
  assert.deepStrictEqual(
    path({
      type: "Polygon",
      coordinates: [
        [
          [0, -11],
          [1, -11],
          [1, -10],
          [0, -10],
          [0, -11],
        ],
      ],
    }).replace(/[.]\d+/g, ""),
    "M482,278L482,276L480,276L480,278L466,279L453,279L506,223L509,276L495,277Z"
  );
});

// the visible pieces of a line (in degrees)
function clipLine(polygon, coordinates) {
  const radians = Math.PI / 180, lines = [];
  const stream = geoClipPolygon(polygon)({
    lineStart() { lines.push([]); },
    point(x, y) { lines.at(-1).push([x / radians, y / radians]); },
    lineEnd() {}
  });
  stream.lineStart();
  for (const [x, y] of coordinates) stream.point(x * radians, y * radians);
  stream.lineEnd();
  return lines;
}

function assertPieces(lines, expected) {
  assert.strictEqual(lines.length, expected.length, JSON.stringify(lines));
  const ends = lines.map((line) => [line[0], line.at(-1)]).sort((a, b) => a[0][0] - b[0][0]);
  for (let i = 0; i < ends.length; ++i) {
    for (let j = 0; j < 2; ++j) {
      assert(Math.abs(ends[i][j][0] - expected[i][j][0]) < 1e-3 && Math.abs(ends[i][j][1] - expected[i][j][1]) < 0.05, JSON.stringify(ends));
    }
  }
}

const square = {type: "Polygon", coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]};

it("clipPolygon clips a line with a polygon that crosses the antimeridian", () => {
  // vertices beyond 180°
  const polygon = {type: "Polygon", coordinates: [[[135, 24], [135, 54], [190, 54], [190, 24], [135, 24]]]};
  const parallel = Array.from({length: 145}, (_, i) => [-180 + 2.5 * i, 42]);
  assertPieces(clipLine(polygon, parallel), [[[-180, 42], [-170, 42]], [[135, 42], [180, 42]]]);
});

it("clipPolygon clips a line whose vertices are on the polygon’s edges", () => {
  assertPieces(clipLine(square, [[-5, 5], [0, 5], [5, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[-5, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[-5, 5], [0, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[5, 5], [10, 5], [15, 5], [10, 6], [5, 6]]), [[[5, 5], [10, 5]], [[10, 6], [5, 6]]]);
});

it("clipPolygon clips a line whose vertices are the polygon’s vertices", () => {
  const polygon = {type: "Polygon", coordinates: [[[0, 0], [0, 5], [0, 10], [10, 10], [10, 5], [10, 0], [0, 0]]]};
  assertPieces(clipLine(polygon, [[-5, 5], [0, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  // touching a vertex from outside
  assertPieces(clipLine(polygon, [[15, 0], [10, 0], [15, -5]]), []);
});

it("clipPolygon clips graticule lines with a box whose edges go through their vertices", () => {
  // the parallel has vertices on the meridian edges
  const polygon = {type: "Polygon", coordinates: [[[0, -85], [0, -60], [90, -60], [90, -85], [0, -85]]]};
  const parallel = Array.from({length: 145}, (_, i) => [-180 + 2.5 * i, -80]);
  const lines = clipLine(polygon, parallel);
  assert.strictEqual(lines.length, 1, JSON.stringify(lines.map((line) => [line[0], line.at(-1)])));
  assert(Math.abs(lines[0][0][0]) < 1e-6 && Math.abs(lines[0].at(-1)[0] - 90) < 1e-6, JSON.stringify([lines[0][0], lines[0].at(-1)]));
});

it("clipPolygon clips a line along an edge of the polygon", () => {
  // a slit down to the equator, as in interrupted projections
  const e = 1e-7;
  const polygon = {type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [-e, 10], [-e, 0], [e, 0], [e, 10], [10, 10], [10, -10], [-10, -10]]]};
  const lines = clipLine(polygon, [[-5, 0], [-2.5, 0], [0, 0], [2.5, 0], [5, 0]]);
  let visible = 0;
  for (const line of lines) visible += line.at(-1)[0] - line[0][0];
  assert(Math.abs(visible - 10) < 3 * e, JSON.stringify(lines));
});
