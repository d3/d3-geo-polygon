import * as Plot from "npm:@observablehq/plot";
import { FileAttachment } from "observablehq:stdlib";

export async function map(projection, {aspectRatio = 1, dark = false} = {}) {
  const land = await FileAttachment("./world.json").json();
  return Plot.plot({
    width: 1024,
    height: 1024 * aspectRatio,
    projection,
    marks: [
      Plot.sphere({fill: dark ? "#121212" : "white"}),
      Plot.geo(land, {fill: dark ? "white" : "black"}),
      Plot.graticule({stroke: "#888", strokeOpacity: 0.3}),
      Plot.sphere(),
    ],
  });
}

