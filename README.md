Start by installing all dependencies (npm i). This has been tested with node v4.7.0 and some dependencies are known to have errors with node > 4

# process tiles

## scraper

This step is needed if you don't have the raw tiles locally.

```
node ./scraper path startingZoomLevel boundingBox [getHigherZoomLevels]
node ./scraper data 6 -17.578125,34.452218,-4.042969,44.213710

```
Will download tiles within `boundingBox` to `path` from `startingZoomLevel`
boundingBox uses the standard [w, s, e, n] format
getHigherZoomLevels will download higher zoom levels in the bounding box


## cruncher (tilereduce to PBF tiles)

The cruncher leverages `tilereduce` to allow distributing tile processing over multiple CPU cores.
To get an idea of how it will perform for the whole tileset, you can run it with different scenarios :
- run it on a small bounding box
- then run it on the whole planet (-179, -89, 179, 89)
For the moment the cruncher only supports one zoom level, but using the max zoom level available should give us a good idea on how it will perform overall. For instance, zoom 10 will get 1048576 (theoretical) tiles of the 1398096 (theoretical) tiles (z levels 2 - 10)

```
node ./cruncher path zoomLevel boundingBox
node ./cruncher path 6 -17.578125,34.452218,-4.042969,44.213710
```

This will generate PBF tiles in `path` from raw tiles (expected to be at `http://localhost:8010/{z},{x},{y}`).

## cruncher (tippecanoe) (deprecated)

Convert GeoJSON data to mbtiles:
```
npm run tippecanoe
```



# client

Use this branch https://github.com/Vizzuality/GlobalFishingWatch/pull/632

Switch from normal tiles to PBF tiles by setting VECTOR to true:
https://github.com/Vizzuality/GlobalFishingWatch/pull/632/files?diff=unified#diff-507d1cdbdb4b2ccffcfc78aae71f57eaR4

Change tile server URL schema in VectorTile.js:
https://github.com/Vizzuality/GlobalFishingWatch/pull/632/files?diff=unified#diff-cfce8bd2e1e0bfe899c82e36d1f7a67fR14


# tile servers

## PBF tiles

```
npm run tilserver-pbf
```

Will start a simple http-server with CORS headers turned on on port 9090.

## tilelive with mbtiles (deprecated)

Run simple `tilelive` server with mbtiles file (port 7070):
```
npm start [mbtilesPath]
```

mbtilesPath assumed to be data/vessels.mbtiles by default.

## tileserver-gl

This is an experiment to see if we could replicate Mapbox styling capapbilities on our own infra.

Run tileserver-gl (port 8080):
```
npm run tileserver-gl
```



# Convert Mapbox style to tileserver-gl style ?

```
"sources": {
    "composite": {
        "url": "mapbox://mapbox.mapbox-streets-v7,mapbox.92olaqdt,mapbox.mapbox-terrain-v2,mapbox.9tm8dx88,mapbox.4suez6c9,mapbox.akwnx50w,mapbox.8x70v9py,mapbox.b1l3wqbs,mapbox.cc9j0p61,mapbox.d4advw8k",
        "type": "vector"
    }
},
```
TO:
```
"sources": {
  "openmaptiles": {
    "type": "vector",
    "url": "http://34.230.92.118:8080/data/haiti.json"
  }
},
```


Some `source-layer` names change?

```
"id": "tunnel-street-case",
...
"source": "composite",
"source-layer": "road",
```
TO:
```
"id": "tunnel-street-case",
...
"source": "openmaptiles",
"source-layer": "transportation",
```
