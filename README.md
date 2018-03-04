# d3-geo-polygon

Clipping and geometric operations for spherical polygons. 

## Installing

If you use NPM, `npm install d3-geo-polygon`. Otherwise, download the [latest release](https://github.com/d3/d3-geo-polygon/releases/latest). You can also load directly from [unpkg](https://unpkg.com/d3-geo-polygon/). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://unpkg.com/d3-geo@1"></script>
<script src="https://unpkg.com/d3-geo-polygon@1"></script>
<script>

// new projection
var projection = d3.geoDodecahedral();

// polyhedral projections don’t need SVG or canvas clipping anymore
var projection = d3.geoPolyhedralCollignon();

// arbitrary polygon clipping on any projection
var projection = d3.geoEquirectangular()
    .preclip(d3.geoClipPolygon({
      type: "Polygon",
      coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]]
    }));

</script>
```

## API Reference

<a name="geoClipPolygon" href="#geoClipPolygon">#</a> d3.<b>geoClipPolygon</b>(<i>polygon</i>) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/clip/polygon.js "Source")

Given a GeoJSON *polygon*, returns a clip function suitable for [_projection_.preclip](https://github.com/d3/d3-geo#preclip).


<a name="polygon" href="#polygon">#</a> clip.<b>polygon</b>()

Given a clipPolygon function, returns the GeoJSON polygon.



## Projections


d3-geo-polygon adds polygon clipping to the polyhedral projections from [d3-geo-projection](https://github.com/d3/d3-geo-projection). Thus, it supercedes the following symbols:


<a href="#geoPolyhedral" name="geoPolyhedral">#</a> d3.<b>geoPolyhedral</b>(<i>root</i>, <i>face</i>[, <i>angle</i>]) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/index.js "Source")

Defines a new polyhedral projection. The *root* is a spanning tree of polygon face nodes; each *node* is assigned a *node*.transform matrix. The *face* function returns the appropriate *node* for a given *lambda* and *phi* in radians. The specified rotation *angle* is applied to the polyhedron; if an *angle* is not specified, it defaults to -π / 6 (for butterflies).
<a href="#geoPolyhedral_root" name="geoPolyhedral_root">#</a> <i>polyhedral</i>.<b>root</b>() returns the root of the polyhedron, from which one can infer the faces’ centers, polygons, shared edges etc.


<a href="#geoPolyhedralButterfly" name="geoPolyhedralButterfly">#</a> d3.<b>geoPolyhedralButterfly</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/butterfly.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralButterfly.png" width="480" height="250">](http://bl.ocks.org/mbostock/4458680)

The gnomonic butterfly projection.

<a href="#geoPolyhedralCollignon" name="geoPolyhedralCollignon">#</a> d3.<b>geoPolyhedralCollignon</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/collignon.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralCollignon.png" width="480" height="250">](https://www.jasondavies.com/maps/collignon-butterfly/)

The Collignon butterfly projection.

<a href="#geoPolyhedralWaterman" name="geoPolyhedralWaterman">#</a> d3.<b>geoPolyhedralWaterman</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/waterman.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralWaterman.png" width="480" height="250">](https://www.jasondavies.com/maps/waterman-butterfly/)

A butterfly projection inspired by Steve Waterman’s design.


New projections are introduced:

<a href="#geoDodecahedral" name="geoDodecahedral">#</a> d3.<b>geoDodecahedral</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/dodecahedral.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/dodecahedral.png" width="480" height="250">](https://bl.ocks.org/Fil/61bf310184055add159620a977112069)

The dodecahedral projection.

