# d3-geo-polygon

Clipping and geometric operations for spherical polygons. 

## Installing

If you use NPM, `npm install d3-geo-polygon`. Otherwise, download the [latest release](https://github.com/d3/d3-geo-polygon/releases/latest). You can also load directly from [unpkg](https://unpkg.com/d3-geo-polygon/). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://unpkg.com/d3-geo@1"></script>
<script src="https://unpkg.com/d3-geo-polygon@1"></script>
<script>

  var clipPolygon = d3.geoClipPolygon({ type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]] });
  var projection = d3_geo.geoEquirectangular().preclip(clipPolygon);

</script>
```

## API Reference

<a name="geoClipPolygon" href="#geoClipPolygon">#</a> d3.<b>geoClipPolygon</b>(<i>polygon</i>) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/clip/polygon.js "Source")

Given a GeoJSON *polygon*, returns a clip function suitable for [_projection_.preclip](https://github.com/d3/d3-geo#preclip).
