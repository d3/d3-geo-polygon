import * as snapshots from "./test/snapshots.js";

export default {
  title: "d3-geo-polygon",
  src: "docs",
  output: "dist/docs",
  async *dynamicPaths() {
    for (const snapshot of Object.keys(snapshots)) {
      yield `/snapshots/${snapshot}.png`;
      yield `/snapshots/${snapshot}-dark.png`;
    }
  },
};
