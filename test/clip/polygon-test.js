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

it("clipPolygon clips a line with a polygon that crosses the antimeridian", () => {
  // vertices beyond 180°
  const polygon = {type: "Polygon", coordinates: [[[135, 24], [135, 54], [190, 54], [190, 24], [135, 24]]]};
  const parallel = Array.from({length: 145}, (_, i) => [-180 + 2.5 * i, 42]);
  assertPieces(clipLine(polygon, parallel), [[[-180, 42], [-170, 42]], [[135, 42], [180, 42]]]);
});
