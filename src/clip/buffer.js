import noop from "../noop.js";

export default function() {
  let lines = [];
  let line;
  return {
    point: function(x, y, i, t) {
      const point = [x, y];
      // when called by clipPolygon, store index and t
      if (arguments.length > 2) { point.index = i; point.t = t; }
      line.push(point);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      const result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
