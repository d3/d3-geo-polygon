var tape = require("tape"),
    d3 = require("../../");

tape("d3.geoClipPolygon is not yet implemented", test => {
  test.throws(d3.geoClipPolygon, /not yet implemented/);
  test.end();
});
