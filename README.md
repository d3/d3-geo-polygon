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

Given a GeoJSON *polygon* or *multipolygon*, returns a clip function suitable for [_projection_.preclip](https://github.com/d3/d3-geo#preclip).


<a name="polygon" href="#polygon">#</a> clip.<b>polygon</b>()

Given a clipPolygon function, returns the GeoJSON polygon.


<a name="geoIntersectArc" href="#geoIntersectArc">#</a> d3.<b>geoIntersectArc</b>(<i>arcs</i>) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/intersect.js "Source")

Given two spherical arcs [point0, point1] and [point2, point3], returns their intersection, or undefined if there is none. See “[Spherical Intersection](https://observablehq.com/@fil/spherical-intersection)”.

<a name="polygon" href="#polygon">#</a> clip.<b>polygon</b>()

Given a clipPolygon function, returns the GeoJSON polygon.



## Projections


d3-geo-polygon adds polygon clipping to the polyhedral projections from [d3-geo-projection](https://github.com/d3/d3-geo-projection). Thus, it supercedes the following symbols:


<a href="#geoPolyhedral" name="geoPolyhedral">#</a> d3.<b>geoPolyhedral</b>(<i>tree</i>, <i>face</i>) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/index.js "Source")

Defines a new polyhedral projection. The *tree* is a spanning tree of polygon face nodes; each *node* is assigned a *node*.transform matrix. The *face* function returns the appropriate *node* for a given *lambda* and *phi* in radians.

<a href="#geoPolyhedral_tree" name="geoPolyhedral_tree">#</a> <i>polyhedral</i>.<b>tree</b>() returns the spanning tree of the polyhedron, from which one can infer the faces’ centers, polygons, shared edges etc.


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

<a href="#geoPolyhedralVoronoi" name="geoPolyhedralVoronoi">#</a> d3.<b>geoPolyhedralVoronoi</b>([<i>parents</i>], [<i>polygons</i>], [<i>faceProjection</i>], [<i>faceFind</i>]) [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/voronoi.js "Source")

Returns a polyhedral projection based on the *polygons*, arranged in a tree according to the *parents* list. *polygons* are a GeoJSON FeatureCollection of geoVoronoi cells, which should indicate the corresponding sites (see [d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)). An optional [*faceProjection*](#geoPolyhedral) is passed to d3.geoPolyhedral() -- note that the gnomonic projection on the polygons’ sites is the only faceProjection that works in the general case.

The .<b>parents</b>([<i>parents</i>]), .<b>polygons</b>([<i>polygons</i>]), .<b>faceProjection</b>([<i>faceProjection</i>]) set and read the corresponding options. Use <i>.faceFind(voronoi.find)</i> for faster results.

<a href="#geoCubic" name="geoCubic">#</a> d3.<b>geoCubic</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/cubic.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cubic.png" width="480" height="250">](https://beta.observablehq.com/@fil/cubic-projections)

The cubic projection.

<a href="#geoDodecahedral" name="geoDodecahedral">#</a> d3.<b>geoDodecahedral</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/dodecahedral.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/dodecahedral.png" width="480" height="250">](https://beta.observablehq.com/@fil/dodecahedral-projection)

The dodecahedral projection.

<a href="#geoIcosahedral" name="geoIcosahedral">#</a> d3.<b>geoIcosahedral</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/icosahedral.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/icosahedral.png" width="480" height="250">](https://beta.observablehq.com/@fil/icosahedral-projections)

The icosahedral projection.

<a href="#geoAirocean" name="geoAirocean">#</a> d3.<b>geoAirocean</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/airocean.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/airocean.png" width="480" height="250">](https://beta.observablehq.com/@fil/airocean-projection)

Buckminster Fuller’s Airocean projection (also known as “Dymaxion”), based on a very specific arrangement of the icosahedron which allows continuous continent shapes. Fuller’s triangle transformation, as formulated by Robert W. Gray (and implemented by Philippe Rivière), makes the projection almost equal-area.

<a href="#geoCahillKeyes" name="geoCahillKeyes">#</a> d3.<b>geoCahillKeyes</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/cahillKeyes.js "Source")
<br><a href="#geoCahillKeyesRaw" name="geoCahillKeyesRaw">#</a> d3.<b>geoCahillKeyes</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cahillKeyes.png" width="480" height="250">](http://www.genekeyes.com/)

The Cahill-Keyes projection, designed by Gene Keyes (1975), is built on Bernard J. S. Cahill’s 1909 octant design. Implementation by Mary Jo Graça (2011), ported to D3 by Enrico Spinielli (2013).

<a href="#geoImago" name="geoImago">#</a> d3.<b>geoImago</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/imago.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/imago.png" width="480" height="250">](https://kunimune.home.blog/2017/11/23/the-secrets-of-the-authagraph-revealed/)

The Imago projection, engineered by Justin Kunimune (2017), is inspired by Hajime Narukawa’s AuthaGraph design (1999).

<a href="#imago_k" name="imago_k">#</a> <i>imago</i>.<b>k</b>([<i>k</i>])

Exponent. Useful values include 0.59 (default, minimizes angular distortion of the continents), 0.68 (gives the best approximation of the Authagraph) and 0.72 (prevents kinks in the graticule).

<a href="#imago_shift" name="imago_cut">#</a> <i>imago</i>.<b>shift</b>([<i>shift</i>])

Horizontal shift. Defaults to 1.16.

<a href="#geoTetrahedralLee" name="geoTetrahedralLee">#</a> d3.<b>geoTetrahedralLee</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/tetrahedralLee.js "Source")
<br><a href="#geoLeeRaw" name="geoLeeRaw">#</a> d3.<b>geoLeeRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/tetrahedralLee.png" width="480" height="250">](https://bl.ocks.org/Fil/c36ed66a4d50d77150712c80642a78d5)

Lee’s tetrahedral conformal projection.

<a href="tetrahedralLee_angle" name="polyhedralLee_angle">#</a> Default <i>angle</i> is +30°, apex up (-30° for base up, apex down).

Default aspect uses *projection*.rotate([30, 180]) and has the North Pole at the triangle’s center -- use *projection*.rotate([-30, 0]) for the [South aspect](https://beta.observablehq.com/@fil/lee-projection).

<a href="#geoCox" name="geoCox">#</a> d3.<b>geoCox</b>() [<>](https://github.com/d3/d3-geo-polygon/blob/master/src/cox.js "Source")
<br><a href="#geoCoxRaw" name="geoCoxRaw">#</a> d3.<b>geoCoxRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cox.png" width="480" height="250">](https://visionscarto.net/cox-conformal-projection)

The Cox conformal projection.

