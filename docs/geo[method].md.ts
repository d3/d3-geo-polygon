import { parseArgs } from "node:util";
import * as d3 from "d3-geo";
import * as P from "../src/index.js";

const {
  values: { method },
} = parseArgs({
  options: { method: { type: "string", default: "" } },
});

const information = {
  Berghaus: {
    define: "geoBerghaus().rotate([0, -90, 90])",
    comment:
      "Hermann Berghaus’s star-shaped projection (1879). The aspect described above has been used by the American Association of Geography as their logo, since 1911.",
  },
  Cubic: {
    define: "geoCubic()",
  },
};

function getProjection(method: string | undefined): string {
  if (!method) return "";
  return information[method]?.define ?? `geo${method}()`;
}

function getComment(method: string | undefined): string {
  if (!method) return "";
  return information[method]?.comment ?? "";
}

process.stdout.write(`---
theme: alt
index: true
---

# ${method}

`);

// Is this a projection?
const aspectRatio = getAspectRatio(method);
if (aspectRatio) {
  const width = 1024;
  const height = Math.ceil(1024 * aspectRatio);
  process.stdout.write(`

~~~js
import {map} from "/map.js";
~~~

<svg viewBox="0,0,${width},${height}" style="max-width: 100%">
\${map(
  projection.fitExtent([[1, 1], [${width - 1}, ${
    height - 1
  }]], {type:"Sphere"}),
  { dark, aspectRatio: ${aspectRatio} }
)}
</svg>

~~~js echo
import {geo${method}} from "npm:d3-geo-polygon@2";
const projection = ${getProjection(method)};
~~~


${getComment(method)}

`);
} else {
  process.stdout.write("Not much to say for now about this method");
}

function getAspectRatio(method: string) {
  try {
    const projection = P[`geo${method}`]();
    const path = d3.geoPath(projection);
    const [[x1, y1], [x2, y2]] = path.bounds({ type: "Sphere" });
    return Math.min(0.8, (y2 - y1) / (x2 - x1));
  } catch (e) {
    return null;
  }
}
