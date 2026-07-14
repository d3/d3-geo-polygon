---
theme: alt
index: true
---

# geoTwoPointEquidistant(point1, point2)

Given two points, this projection guarantees that the distances to the two reference points are proportional to their true distance (geodesic).

```js
import { map } from "/map.js";
```

<svg id="map">
${map(projection, { dark, aspectRatio: 1 })}
</svg>

```js echo
import { geoTwoPointEquidistant } from "npm:d3-geo-polygon@2";
const projection = geoTwoPointEquidistant([0, 0], [0, 90]).angle(90);
```

By default the two points are projection to the horizontal axis: use `projection.`**`angle`** to change the map’s azimuth.

Thanks to polygon clipping, this projection displays 99.9996% of the sphere vs. 78% with circle clipping (this number depends on how far the two reference points are).

The [two-point equidistant USA](./geoTwoPointEquidistantUsa) is a common aspect for this projection.

```js
const height = width * 0.8;
const m = document.getElementById("map");
m.setAttribute("viewBox", [0, 0, width, height]);
m.style = "max-width: 100%;";
projection.fitExtent(
  [
    [1, 1],
    [width - 1, height - 1],
  ],
  { type: "Sphere" }
);

d3.range(10, 180, 10).map(r => m.appendChild(svg`<path d="${d3.geoPath(projection)(d3.geoCircle().center([0, 0]).radius(r)())}" fill="none" stroke="orange"></path><path d="${d3.geoPath(projection)(d3.geoCircle().center([0, 90]).radius(r)())}" fill="none" stroke="lightblue">`))

```
