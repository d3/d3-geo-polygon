import * as snapshots from "../../test/snapshots.js";
import {parseArgs} from "node:util";

const {
  values: {projection, dark}
} = parseArgs({
  options: {projection: {type: "string"}, dark: {type: "string"}}
});

snapshots[projection]()
  .then((canvas) => {
    if (dark === "dark") {
      const context = canvas.getContext("2d");
      const im = context.getImageData(0, 0, canvas.width, canvas.height);
      const {data} = im
      for (let i = 0; i < data.length; ++i) {
        if ((i % 4) < 3) data[i] = 30 + 225 * (1 - data[i] / 255);
      }
      context.putImageData(im, 0, 0);
    }
    process.stdout.write(canvas.toBuffer("image/png"))
  });
