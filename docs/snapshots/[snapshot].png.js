import * as snapshots from "../../test/snapshots.js";
import {parseArgs} from "node:util";
import sharp from "sharp";

const {
  values: {snapshot}
} = parseArgs({
  options: {snapshot: {type: "string"}}
});

const {projection, dark} = snapshot.match(/^(?<projection>.*?)(-(?<dark>dark))?$/).groups;

snapshots[projection]()
  .then(async(canvas) => {
    if (dark) {
      const context = canvas.getContext("2d");
      const im = context.getImageData(0, 0, canvas.width, canvas.height);
      const {data} = im
      for (let i = 0; i < data.length; ++i) {
        if ((i % 4) < 3) data[i] = 30 + 225 * (1 - data[i] / 255);
      }
      context.putImageData(im, 0, 0);
    }
    process.stdout.write(await sharp(canvas.toBuffer()).png({quality: 60}).toBuffer())
  });
