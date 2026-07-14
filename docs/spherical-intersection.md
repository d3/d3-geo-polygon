Drag the points & rotate the sphere.

This notebook is based on Jason Davies’ [visual demo](https://www.jasondavies.com/maps/intersect/) for the inspiration, and more importantly for the original algorithm — used for clipping in [d3-geo-polygon](https://github.com/d3/d3-geo-polygon).

```js
{
  redraw;
  const c = DOM.context2d(width, height).canvas;
  return mapcanvas(projection, c, {});
}
```

```js
viewof arrangement = Inputs.select(
  new Map([
    ["Standard case", 0],
    ["Flipped  (solution = antipode of candidate)", -1],
    ["No intersection", -2],
    ["Points far apart", -3],
    ["Points far apart 2", -4],
    ["B=A", 1],
    ["C=A", 2],
    ["D=A", 3],
    ["D=C", 4],
    ["C & D are antipodal (solution undefined)", 5],
    ["touching", 6],
    ["collinear", 7],
    ["orthogonal", 8],
    ["orthogonal, flipped", 9],
    ["equatorial", 10]
  ]),
  { label: "A list of cases, including edge cases." }
)
```

```js
viewof proj = Inputs.select([
  "Orthographic",
  "Equirectangular",
  "Stereographic",
  "Gnomonic",
  "Mercator",
  "EqualEarth"
])
```

```js
viewof reset = html`<button>▶︎ Reset`
```

```js
positions = {
  updated;
  const candidate = displayspherical(
      circleintersection(...points.map(cartesianDegrees))
    ),
    solution = displayspherical(intersection(...points.map(cartesianDegrees)));

  return md`Candidate: <tt>${candidate}</tt><br>Solution: <tt>${solution}</tt>`;
}
```

**Explanation.** Let [A,B] and [C,D] be two arcs of great circles on the globe. Finding their intersection is a bit more challenging than it seems.

Leaving aside edge cases, the procedure begins by finding a candidate as one of the points where the great circles defined by the normal vectors ${tex`AB = A\times{B}`} and ${tex`CD = C\times{D}`} intersect. A formula for this candidate is
> ${tex`i = AB\times{CD}`}.

To check if _i_ lies between A and B, we compare the direction one has to take from _i_ to B with the direction from A to B. If it is the same direction, and similarly for all points, then the candidate is the solution.

Of course, the two great circles intersect in two places: the candidate and its antipode. If the candidate is rejected, we test the antipode (tests are the same, but with negative signs).

The algorithm also needs to validate edge cases (compare with [the original algorithm](https://beta.observablehq.com/d/68d66f0bacb5cd36)).

```js
points = {
  reset;
  const points = [
    [0, 70],
    [-10, 10],
    [-40, 30],
    [10, 45]
  ];
  switch (+arrangement) {
    case 0:
      break;
    case -1: // reversed
      let p = points[1];
      points[1] = points[0];
      points[0] = p;
      break;
    case -2: // no solution
      let q = points[2];
      points[2] = points[0];
      points[0] = q;
      break;
    case -3: // points far apart
      points[0] = [0, 89.99];
      points[1] = [0, -89.99];
      points[2] = [-89.99, 0];
      points[3] = [89.99, 0];
      break;
    case -4: // points far apart, 2
      points[0] = [0, 89.99];
      points[1] = [0, -89.99];
      points[2] = [0, 0];
      points[3] = [(0.5 - Math.random()) * 50, 0];
      break;
    case 1: // B=A
      points[1] = points[0];
      break;
    case 2: // C=A
      points[2] = points[0];
      break;
    case 3: // D=A
      points[3] = points[0];
      break;
    case 4: // D=C
      points[3] = points[2];
      break;
    case 5: // D=-C
      points[3] = [points[2][0] + 180, -points[2][1]];
      break;
    case 6: // touching
      points[0] = [80 * Math.random() - 40, 20];
      points[1] = [80 * Math.random() - 40, 90 * Math.random()];
      points[2] = [80 * Math.random() - 40, -20];
      points[3] = [80 * Math.random() - 40, -90 * Math.random()];
      let i = (Math.random() * 4) | 0;
      points[i] = d3.geoInterpolate(
        points[3 - 2 * ((i / 2) | 0)],
        points[2 - 2 * ((i / 2) | 0)]
      )(Math.random());
      break;
    case 7: // collinear, this examples breaks for epsilon=1e-13
      points[2] = points[0];
      points[3] = [18.279023657167595, 82.06656745045608];
      break;
    case 8:
      points[0] = [0, 0];
      points[1] = [0, 90];
      points[2] = [70, 0];
      points[3] = [90, 0];
      break;
    case 9:
      points[0] = [0, 90];
      points[1] = [0, 0];
      points[2] = [70, 0];
      points[3] = [90, 0];
      break;
    case 10:
      points[0] = [0, 90];
      points[1] = [0, 0];
      points[2] = [10, 0];
      points[3] = [90, 0];
  }
  return points;
}
```

----

_code adapted from d3-geo-polygon_

```js echo
function intersectSegment(from, to) {
  this.from = from;
  this.to = to;
  this.normal = cartesianCross(from, to);
  this.fromNormal = cartesianCross(this.normal, from);
  this.toNormal = cartesianCross(this.normal, to);
}
```

```js echo
function intersect(a, b, candidate) {
  if (cartesianEqual(a.from, b.from) || cartesianEqual(a.from, b.to))
    return a.from;
  if (cartesianEqual(a.to, b.from) || cartesianEqual(a.to, b.to)) return a.to;

  var axb = cartesianCross(a.normal, b.normal),
    norm2 = cartesianDot(axb, axb);
  cartesianNormalizeInPlace(axb);

  if (candidate) return axb;

  // if A=B or are antipodals, or C=D or antipodals
  // the solution is undefined.
  // If ABCD are on the same circle, same answer for the moment (todo?)
  if (norm2 < 1e-30) return undefined;

  var a0 = cartesianDot(axb, a.fromNormal),
    a1 = cartesianDot(axb, a.toNormal),
    b0 = cartesianDot(axb, b.fromNormal),
    b1 = cartesianDot(axb, b.toNormal);

  // check if the candidate lies on both segments
  // or is almost equal to one of the four points
  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 > 0 && cartesianEqual(axb, a.from)) ||
    (a1 < 0 && cartesianEqual(axb, a.to)) ||
    (b0 > 0 && cartesianEqual(axb, b.from)) ||
    (b1 < 0 && cartesianEqual(axb, b.to))
  )
    return axb;

  // same test for the antipode
  axb[0] = -axb[0];
  axb[1] = -axb[1];
  axb[2] = -axb[2];
  a0 = -a0;
  a1 = -a1;
  b0 = -b0;
  b1 = -b1;

  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 > 0 && cartesianEqual(axb, a.from)) ||
    (a1 < 0 && cartesianEqual(axb, a.to)) ||
    (b0 > 0 && cartesianEqual(axb, b.from)) ||
    (b1 < 0 && cartesianEqual(axb, b.to))
  )
    return axb;

  return false;
}
```

----

_sugar_

```js echo
function circleintersection(a, b, c, d) {
  return intersect(
    new intersectSegment(a, b),
    new intersectSegment(c, d),
    /* candidate = */ true
  );
}
```

```js echo
function intersection(a, b, c, d) {
  return intersect(
    new intersectSegment(a, b),
    new intersectSegment(c, d),
    /* candidate = */ false
  );
}
```

----
_geometry_

```js
import {cartesian, cartesianCross, cartesianDot, cartesianNormalizeInPlace, spherical} from "@fil/cartesian"
```

```js
function cartesianEqual(a, b) {
  var dx = b[0] - a[0],
    dy = b[1] - a[1],
    dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz < epsilon2 * epsilon2;
}
```

```js
vecadd = (a, b) => a.map((d, i) => d + b[i])
```

```js
vecmul = (a, k) => a.map(d => k * d)
```

```js
function dist3dsquared(a, b) {
  a = [[a[0] - b[0], a[1] - b[1], a[2] - b[2]]];
  return cartesianDot(a, a);
}
```

```js
function cartesianDegrees(point) {
  return cartesian([point[0] * radians, point[1] * radians]);
}
```

```js
function sphericalDegrees(point) {
  return spherical(point).map(d => d * degrees);
}
```

-----

_draw_

```js
projection = (reset,
d3["geo" + proj]()
  .rotate(
    proj == "Orthographic"
      ? [0, -30]
      : proj === "Gnomonic"
        ? [0, -40, -20]
        : [0, 0]
  )
  .precision(0.1)
  .fitExtent([[10, 10], [width - 10, height - 10]], { type: "Sphere" }))
```

```js
function mapcanvas(projection, c, opts) {
  const context = c.getContext("2d"),
    path = d3.geoPath(projection, context);

  let hover;

  if (opts.clip) context.beginPath(), path(opts.clip), context.clip();

  function render() {
    context.clearRect(0, 0, width, c.height);

    context.beginPath(),
      path({ type: "Sphere" }),
      (context.fillStyle = "#fefef2"),
      context.fill();

    context.beginPath(),
      (context.lineWidth = 0.5),
      path(d3.geoGraticule()()),
      (context.strokeStyle = "#ddd"),
      context.stroke();

    context.beginPath(),
      path({ type: "Sphere" }),
      (context.strokeStyle = "#000"),
      context.stroke();

    // outer great circles
    const antipodeAB = d3.geoInterpolate(points[0], points[1])(0.5);
    (antipodeAB[0] += 180), (antipodeAB[1] *= -1);
    const antipodeCD = d3.geoInterpolate(points[2], points[3])(0.5);
    (antipodeCD[0] += 180), (antipodeCD[1] *= -1);

    context.beginPath(),
      context.setLineDash([3, 8]),
      (context.lineWidth = 0.25);
    if (circle_defined(points[0], points[1])) {
      path({
        type: "LineString",
        coordinates: [points[0], antipodeAB, points[1]]
      });
    }
    if (circle_defined(points[2], points[3])) {
      path({
        type: "LineString",
        coordinates: [points[2], antipodeCD, points[3]]
      });
    }

    (context.strokeStyle = "black"), context.stroke();
    context.setLineDash([]);
    context.lineWidth = 1;

    // lines
    context.beginPath();
    if (circle_defined(points[0], points[1])) {
      path({ type: "LineString", coordinates: [points[0], points[1]] });
    }
    if (circle_defined(points[2], points[3])) {
      path({ type: "LineString", coordinates: [points[2], points[3]] });
    }
    (context.strokeStyle = "black"), context.stroke();

    // sites & numbers
    points.forEach((site, i) => {
      context.beginPath(),
        path.pointRadius(10)({ type: "Point", coordinates: site }),
        (context.fillStyle = i === hover ? "#eedddd" : "white"),
        (context.strokeStyle = "black"),
        context.fill(),
        context.stroke();

      if (path.context(null)({ type: "Point", coordinates: site })) {
        (context.textAlign = "center"),
          (context.fillStyle = "black"),
          (context.font = "16px Georgia"),
          (context.textBaseline = "middle"),
          context.fillText(
            String.fromCharCode(65 + i),
            projection(site)[0],
            projection(site)[1] - 1
          );
      }
      path.context(context);
    });

    // intersection
    const A = intersection(...points.map(cartesianDegrees)),
      B = circleintersection(...points.map(cartesianDegrees));

    context.beginPath(),
      path.pointRadius(6)({
        type: "MultiPoint",
        coordinates: [sphericalDegrees(B), sphericalDegrees(vecmul(B, -1))]
      }),
      (context.fillStyle = "white"),
      (context.strokeStyle = "black"),
      context.fill(),
      context.stroke();

    if (A) {
      context.beginPath(),
        path.pointRadius(8)({
          type: "Point",
          coordinates: sphericalDegrees(A)
        }),
        (context.fillStyle = "orange"),
        (context.strokeStyle = "black"),
        context.fill(),
        context.stroke();
    }
  }

  (context.canvas.render = render)();

  let subject,
    rotate,
    sel = d3
      .select(context.canvas)
      .style("cursor", "-webkit-grab")
      .style("cursor", "-moz-grab")
      .style("cursor", "grab");
  const inertia = d3.geoInertiaDrag(
    sel,
    function () {
      context.canvas.render();
    } /* allow overloading map.render */,
    projection,
    {
      start: function () {
        let pos = projection.invert(inertia.position),
          point = d3.scan(points.map((point) => d3.geoDistance(point, pos)));
        if (d3.geoDistance(points[point], pos) < 0.2) subject = point;
        else subject = -1;
        rotate = projection.rotate();
      },
      move: function () {
        if (subject > -1) {
          projection.rotate(rotate);
          inertia.velocity = [0, 0];
          points[subject] = projection.invert(
            inertia.position.map((d) => d - 6) // 6 pixel offset to unclutter the GUI
          );
          render();
          mutable updated = true;
        }
      }
    }
  );
  invalidation.then(() => sel.on(".drag", null));

  sel.on("mousemove", function () {
    hover = -1;
    let pos = projection.invert(inertia.position),
      point = d3.scan(points.map((point) => d3.geoDistance(point, pos)));
    if (d3.geoDistance(points[point], pos) < 0.1) hover = point;
    render();
  });
  invalidation.then(() => sel.on("mousemove", null));

  return context.canvas;
}
```

```js
function circle_defined(A, B) {
  const epsilon = 1e-13,
    d = d3.geoDistance(A, B);
  return d > epsilon && d < pi - epsilon;
}
```

```js
function displayspherical(cartesian) {
  return cartesian
    ? "[ lon: " +
        sphericalDegrees(cartesian)
          .map(d => +d.toFixed(2))
          .join(", lat: ") +
        " ]"
    : cartesian;
}
```

```js
mutable updated = false
```

```js
mutable redraw = false
```

```js
height = width * 0.5
```

----

_libs_

```js
d3 = require("d3@7", "d3-inertia@0.4")
```

```js
import { acos, asin, atan2, cos, degrees, epsilon2, max, min, pi, radians, sin, sqrt } from "@fil/math"
```
