import * as snapshots from "./test/snapshots.js";
import * as exported from "./src/index.js";

const pages = [...Object.keys(exported)]
  .filter((ex) => !(ex.endsWith("Raw") || ex.endsWith("Block")))
  .map((ex) => ({
    path: `/${ex}`,
    name: ex,
  }));

export default {
  title: "d3-geo-polygon",
  root: "docs",
  output: "dist/docs",
  pages,
  search: true,
  async *dynamicPaths() {
    for (const snapshot of Object.keys(snapshots)) {
      yield `/snapshots/${snapshot}.png`;
      yield `/snapshots/${snapshot}-dark.png`;
    }
  },
};
