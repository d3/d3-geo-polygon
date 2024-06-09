import assert from "assert";
import { assertInDelta } from "./asserts.js";
import { geoIntersectArc } from "../src/index.js";

it("spherical intersections", function () {
  let e = geoIntersectArc(
    [
      [0, 0],
      [0, 90],
    ],
    [
      [-10, 40],
      [10, 40],
    ]
  );
  assert(e);
  assertInDelta(e, [0, 40.43246108], 1e-8);

  // https://observablehq.com/@fil/spherical-intersection#points
  const p = [
    [0, 70],
    [-10, 10],
    [-40, 30],
    [10, 45],
  ];

  assertInDelta(geoIntersectArc([p[0], p[1]], [p[0], p[3]]), p[0], 1e-8);
  assertInDelta(geoIntersectArc([p[0], p[1]], [p[1], p[3]]), p[1], 1e-8);
  assertInDelta(geoIntersectArc([p[0], p[1]], [p[2], p[0]]), p[0], 1e-8);
  assertInDelta(geoIntersectArc([p[0], p[1]], [p[2], p[1]]), p[1], 1e-8);

  assertInDelta(
    geoIntersectArc([p[0], p[1]], [p[2], p[3]]),
    [-7.081398732358556, 42.94731141237317],
    1e-8
  );

  assertInDelta(
    geoIntersectArc([p[1], p[0]], [p[2], p[3]]),
    [-7.081398732358556, 42.94731141237317],
    1e-8
  );

  assert(!geoIntersectArc([p[2], p[1]], [p[0], p[3]]));

  assertInDelta(
    geoIntersectArc(
      [
        [0, 89.99],
        [0, -89.99],
      ],
      [
        [-89.99, 0],
        [89.99, 0],
      ]
    ),
    [0, 0],
    1e-8
  );

  assertInDelta(
    geoIntersectArc(
      [
        [0, 89.99],
        [0, -89.99],
      ],
      [
        [0, 0],
        [25, 0],
      ]
    ),
    [0, 0],
    1e-8
  );

  e = geoIntersectArc(
    [
      [0, 0],
      [0, 90],
    ],
    [
      [0, 0],
      [90, 0],
    ]
  );
  assert.deepStrictEqual(e, [0, 0]);

  assert(
    !geoIntersectArc(
      [
        [0, 0],
        [0, 90],
      ],
      [
        [10, 0],
        [90, 0],
      ]
    )
  );
  assert(
    !geoIntersectArc(
      [
        [0, 90],
        [0, 0],
      ],
      [
        [10, 0],
        [90, 0],
      ]
    )
  );
  assert(
    !geoIntersectArc(
      [
        [0, 0],
        [0, 90],
      ],
      [
        [90, 0],
        [10, 0],
      ]
    )
  );
  assert(
    !geoIntersectArc(
      [
        [0, 90],
        [0, 0],
      ],
      [
        [90, 0],
        [10, 0],
      ]
    )
  );
});
