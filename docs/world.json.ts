import topo from "world-atlas/land-50m.json";

import { feature } from "topojson-client";

const isDecimal = /^\d+[.]\d+$/;

process.stdout.write(
  JSON.stringify(feature(topo, topo.objects.land), (_key, u) =>
    typeof u === "number" ? +u.toFixed(3) : u
  )
);
