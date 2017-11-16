This is the backend playground for using vector tiles on <a href="https://github.com/Vizzuality">GlobalFishingWatch</a>

Start by installing all dependencies (npm i). **This has been tested with node v4.7.0 and some dependencies are known to have errors with node > 4. Use a node version manager, ie `nvm use 4`**.
You will also need to install <a href="https://github.com/mapbox/tippecanoe">tippecanoe</a> globally (`brew install tippecanoe` for example).


# process tiles

## encounters-generator

--> GeoJSON --> mbtiles

This is used to prepare dummy data for the encounters layer.
It will first generate a number of point features in a GeoJSON file, then convert it to an mbtiles file (SQLite database) usable by the cruncher.

```
node ./encounters-generator [numFeatures] [maxZoom]
node ./encounters-generator 40000 14
```

Will generate a geojson file, then a mbtiles files with 40000 points, for zoom levels 2 to 14 at `data/encounters/data`

## cruncher (tilereduce to PBF tiles)

mbtiles --> PBF tiles

The cruncher leverages `tilereduce` to allow distributing tile processing over multiple CPU cores. Currently it only takes an mbtiles file as input, but it could support individual tiles files. The cruncher will take all points from the input, convert point properties for efficient rendering (eg sigma and weight to precomputed radius and opacity), and pack them into PBF tiles ready to be consumed by the client. The tiles are generated at zoom levels from input data (`maxZoom`) if generated from `encounters-generator`.

```
node ./cruncher [dataset]
node ./cruncher encounters
```

This will generate PBF tiles in path at `data/encounters/data/PBF` from raw tiles (expected to be served from `http://localhost:9090/{z},{x},{y}`).

## scraper

custom vector tiles (pelagos) --> mbtiles file

This is intended to experiment using vector tiles with the the "raw" fishing activity tiles currently on production. It should generate an mbtiles file usable by the cruncher, from the fishing activity tiles currently on production. The code, currently, generates individual raw tiles rather than a single mbtiles file and so needs to be revised (also, decoding Pelagos tiles is not implemented, code used on the client should be reused here).

```
node ./scraper dataset startingZoomLevel boundingBox [getHigherZoomLevels]
node ./scraper fishing 6 -17.578125,34.452218,-4.042969,44.213710

```
Will download tiles within `boundingBox` to path at `data/[dataset]` from `startingZoomLevel`
boundingBox uses the standard [w, s, e, n] format
getHigherZoomLevels will download higher zoom levels in the bounding box


## inspect mbtiles files

First install tilelive dependencies globally:
```
npm install -g tilelive-vector tilelive-xray mbtiles
```

Then run (uses tessera)
```
npm run mbtiles-inspect [mbtiles file path]
npm run mbtiles-inspect mbtiles://./whatever.mbtiles
```

An inspector should be available at http://localhost:8080/

# client

See
https://github.com/Vizzuality/GlobalFishingWatch/pull/842
and
https://github.com/Vizzuality/GlobalFishingWatch/pull/632


# tile servers

## PBF tiles

```
npm run tileserver-pbf
npm run tileserver-pbf-encounters
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
