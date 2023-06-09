# d3-geo-polygon

Clipping and geometric operations for spherical polygons.

## Installing

If you use NPM, `npm install d3-geo-polygon`. Otherwise, download the [latest release](https://github.com/d3/d3-geo-polygon/releases/latest). You can also load directly from [unpkg](https://unpkg.com/d3-geo-polygon/). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://unpkg.com/d3-geo@3"></script>
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

<a name="geoClipPolygon" href="#geoClipPolygon">#</a> d3.<b>geoClipPolygon</b>(<i>polygon</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/clip/polygon.js), [Examples](https://observablehq.com/@mbostock/spherical-clipping)

Given a GeoJSON *polygon* or *multipolygon*, returns a clip function suitable for [_projection_.preclip](https://github.com/d3/d3-geo#preclip).

<a name="polygon" href="#polygon">#</a> clip.<b>polygon</b>()

Given a clipPolygon function, returns the GeoJSON polygon.

<a name="geoIntersectArc" href="#geoIntersectArc">#</a> d3.<b>geoIntersectArc</b>(<i>arcs</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/intersect.js), [Examples](https://observablehq.com/@fil/spherical-intersection)

Given two spherical arcs [point0, point1] and [point2, point3], returns their intersection, or undefined if there is none. See “[Spherical Intersection](https://observablehq.com/@fil/spherical-intersection)”.

## Projections

d3-geo-polygon adds polygon clipping to the polyhedral projections from [d3-geo-projection](https://github.com/d3/d3-geo-projection). Thus, it supersedes the following symbols:

<a href="#geoPolyhedral" name="geoPolyhedral">#</a> d3.<b>geoPolyhedral</b>(<i>tree</i>, <i>face</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/index.js), [Examples](https://observablehq.com/@fil/polyhedral-projections-with-d3-geo-polygon)

Defines a new polyhedral projection. The *tree* is a spanning tree of polygon face nodes; each *node* is assigned a *node*.transform matrix. The *face* function returns the appropriate *node* for a given *lambda* and *phi* in radians.

<a href="#geoPolyhedral_tree" name="geoPolyhedral_tree">#</a> <i>polyhedral</i>.<b>tree</b>() returns the spanning tree of the polyhedron, from which one can infer the faces’ centers, polygons, shared edges etc.

<a href="#geoPolyhedralButterfly" name="geoPolyhedralButterfly">#</a> d3.<b>geoPolyhedralButterfly</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/butterfly.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralButterfly.png" width="480" height="250">](https://observablehq.com/@d3/polyhedral-gnomonic)

The gnomonic butterfly projection.

<a href="#geoPolyhedralCollignon" name="geoPolyhedralCollignon">#</a> d3.<b>geoPolyhedralCollignon</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/collignon.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralCollignon.png" width="480" height="250">](https://www.jasondavies.com/maps/collignon-butterfly/)

The Collignon butterfly projection.

<a href="#geoPolyhedralWaterman" name="geoPolyhedralWaterman">#</a> d3.<b>geoPolyhedralWaterman</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/waterman.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/polyhedralWaterman.png" width="480" height="250">](https://www.jasondavies.com/maps/waterman-butterfly/)

A butterfly projection inspired by Steve Waterman’s design.

New projections are introduced:

<a href="#geoPolyhedralVoronoi" name="geoPolyhedralVoronoi">#</a> d3.<b>geoPolyhedralVoronoi</b>([<i>parents</i>], [<i>polygons</i>], [<i>faceProjection</i>], [<i>faceFind</i>]) · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/voronoi.js)

Returns a polyhedral projection based on the *polygons*, arranged in a tree according to the *parents* list. *polygons* are a GeoJSON FeatureCollection of geoVoronoi cells, which should indicate the corresponding sites (see [d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)). An optional [*faceProjection*](#geoPolyhedral) is passed to d3.geoPolyhedral() -- note that the gnomonic projection on the polygons’ sites is the only faceProjection that works in the general case.

The .<b>parents</b>([<i>parents</i>]), .<b>polygons</b>([<i>polygons</i>]), .<b>faceProjection</b>([<i>faceProjection</i>]) set and read the corresponding options. Use <i>.faceFind(voronoi.find)</i> for faster results.

<a href="#geoCubic" name="geoCubic">#</a> d3.<b>geoCubic</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/cubic.js), [Examples](https://observablehq.com/@fil/cubic-projections)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cubic.png" width="480" height="250">](https://observablehq.com/@fil/cubic-projections)

The cubic projection.

<a href="#geoDodecahedral" name="geoDodecahedral">#</a> d3.<b>geoDodecahedral</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/polyhedral/dodecahedral.js), [Examples](https://observablehq.com/@fil/dodecahedral-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/dodecahedral.png" width="480" height="250">](https://observablehq.com/@fil/dodecahedral-projection)

The dodecahedral projection.

<a href="#geoIcosahedral" name="geoIcosahedral">#</a> d3.<b>geoIcosahedral</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/icosahedral.js), [Examples](https://observablehq.com/@fil/icosahedral-projections)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/icosahedral.png" width="480" height="250">](https://observablehq.com/@fil/icosahedral-projections)

The icosahedral projection.

<a href="#geoAirocean" name="geoAirocean">#</a> d3.<b>geoAirocean</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/airocean.js), [Examples](https://observablehq.com/@fil/airocean-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/airocean.png" width="480" height="250">](https://observablehq.com/@fil/airocean-projection)

Buckminster Fuller’s Airocean projection (also known as “Dymaxion”), based on a very specific arrangement of the icosahedron which allows continuous continent shapes. Fuller’s triangle transformation, as formulated by Robert W. Gray (and implemented by Philippe Rivière), makes the projection almost equal-area.

<a href="#geoCahillKeyes" name="geoCahillKeyes">#</a> d3.<b>geoCahillKeyes</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/cahillKeyes.js), [Examples](https://observablehq.com/@d3/cahill-keyes)
<br><a href="#geoCahillKeyesRaw" name="geoCahillKeyesRaw">#</a> d3.<b>geoCahillKeyes</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cahillKeyes.png" width="480" height="250">](http://www.genekeyes.com/)

The Cahill-Keyes projection, designed by Gene Keyes (1975), is built on Bernard J. S. Cahill’s 1909 octant design. Implementation by Mary Jo Graça (2011), ported to D3 by Enrico Spinielli (2013).

<a href="#geoImago" name="geoImago">#</a> d3.<b>geoImago</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/imago.js), [Examples](https://observablehq.com/@fil/the-imago-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/imago.png" width="480" height="250">](https://kunimune.home.blog/2017/11/23/the-secrets-of-the-authagraph-revealed/)

The Imago projection, engineered by Justin Kunimune (2017), is inspired by Hajime Narukawa’s AuthaGraph design (1999).

<a href="#imago_k" name="imago_k">#</a> <i>imago</i>.<b>k</b>([<i>k</i>])

Exponent. Useful values include 0.59 (default, minimizes angular distortion of the continents), 0.68 (gives the closest approximation of the AuthaGraph) and 0.72 (prevents kinks in the graticule).

<a href="#imago_shift" name="imago_shift">#</a> <i>imago</i>.<b>shift</b>([<i>shift</i>])

Horizontal shift. Defaults to 1.16.

<a href="#geoTetrahedralLee" name="geoTetrahedralLee">#</a> d3.<b>geoTetrahedralLee</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/tetrahedralLee.js), [Examples](https://observablehq.com/@fil/lee-projection)
<br><a href="#geoLeeRaw" name="geoLeeRaw">#</a> d3.<b>geoLeeRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/tetrahedralLee.png" width="480" height="250">](https://observablehq.com/@d3/lees-tetrahedral)

Lee’s tetrahedral conformal projection.

<a href="#tetrahedralLee_angle" name="tetrahedralLee_angle">#</a> Default <i>angle</i> is +30°, apex up (-30° for base up, apex down).

Default aspect uses *projection*.rotate([30, 180]) and has the North Pole at the triangle’s center -- use *projection*.rotate([-30, 0]) for the [South aspect](https://observablehq.com/@fil/lee-projection).

<a href="#geoCox" name="geoCox">#</a> d3.<b>geoCox</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/cox.js), [Examples](https://observablehq.com/@fil/cox-conformal-projection-in-a-triangle)
<br><a href="#geoCoxRaw" name="geoCoxRaw">#</a> d3.<b>geoCoxRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/cox.png" width="480" height="250">](https://visionscarto.net/cox-conformal-projection)

The Cox conformal projection.

<a href="#geoComplexLog" name="geoComplexLog">#</a> d3.<b>geoComplexLog</b>([<i>planarProjectionRaw</i>[<i>, cutoffLatitude</i>]]) · [Source](https://github.com/d3/d3-geo-polygon/blob/master/src/complexLog.js), [Example](https://cgmi.github.io/complex-log-projection/)
<br><a href="#geoComplexLogRaw" name="geoComplexLogRaw">#</a> d3.<b>geoComplexLogRaw</b>([<i>planarProjectionRaw</i>])

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/master/img/complexLog.png" width="480" height="250">](https://cgmi.github.io/complex-log-projection/)

Complex logarithmic view. This projection is based on the papers by Joachim Böttger et al.:

* [Detail‐In‐Context Visualization for Satellite Imagery (2008)](https://doi.org/10.1111/j.1467-8659.2008.01156.x)
* [Complex Logarithmic Views for Small Details in Large Contexts (2006)](https://doi.org/10.1109/TVCG.2006.126)

The specified raw projection <i>planarProjectionRaw</i> is used to project onto the complex plane on which the complex logarithm is applied.
Recommended are [azimuthal equal-area](https://github.com/d3/d3-geo#geoAzimuthalEqualAreaRaw) (default) or [azimuthal equidistant](https://github.com/d3/d3-geo#geoAzimuthalEquidistantRaw).

<i>cutoffLatitude</i> is the latitude relative to the projection center at which to cutoff/clip the projection, lower values result in more detail around the projection center. Value must be < 0 because complex log projects the origin to infinity.

<a href="#complexLog_planarProjectionRaw" name="complexLog_planarProjectionRaw">#</a> <i>complexLog</i>.<b>planarProjectionRaw</b>([<i>projectionRaw</i>])

If <i>projectionRaw</i> is specified, sets the planar raw projection. See above. If <i>projectionRaw</i> is not specified, returns the current planar raw projection.

<a href="#complexLog_cutoffLatitude" name="complexLog_cutoffLatitude">#</a> <i>complexLog</i>.<b>cutoffLatitude</b>([<i>latitude</i>])

If <i>latitude</i> is specified, sets the cutoff latitude. See above. If <i>latitude</i> is not specified, returns the current cutoff latitude.
