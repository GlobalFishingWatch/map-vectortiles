This is the backend playground for using vector tiles on <a href="https://github.com/GlobalFishingWatch">GlobalFishingWatch</a>

Start by installing all dependencies (npm i). You will also need to install <a href="https://github.com/mapbox/tippecanoe">tippecanoe</a> globally (`brew install tippecanoe` for example).


# process tiles


## encounters conversion (real data)

--> GeoJSON --> mbtiles

This is used to compile the encounters CSV into an mbtiles (to feed further PBF tiles generation by the [cruncher](https://github.com/Vizzuality/GlobalFishingWatch-vector#cruncher-tilereduce-to-pbf-tiles))

```
node ./encounters-convert [CSVFile]
node ./encounters-convert data/encounters/encounters_20180111.csv
```

Note: the data originally provided as CSV has been altered on a CartoDB instance using the following SQL:
```
SELECT
the_geom,
('encounters' || cartodb_id) as series,
(CAST (event_duration_hr as DOUBLE PRECISION))*60*60 *1000 as duration,
EXTRACT(EPOCH FROM CAST (start_time AS DATE))*1000 as datetime
FROM encounters_20180111
```

(see http://cartodb.skytruth.org/user/erikescoffier/tables/encounters_20180111)


Will generate a geojson file, then a mbtiles files with 40000 points, for zoom levels 2 to 14 at `data/encounters/data`

## cruncher (tilereduce to PBF tiles)

mbtiles --> PBF tiles

The cruncher leverages `tilereduce` to allow distributing tile processing over multiple CPU cores. Currently it only takes an mbtiles file as input, but it could support individual tiles files. The cruncher will take all points from the input, convert point properties for efficient rendering (eg sigma and weight to precomputed radius and opacity), and pack them into PBF tiles ready to be consumed by the client. The tiles are generated at zoom levels from input data (`maxZoom`) if generated from `encounters-generator`.

```
node ./cruncher [dataset]
node ./cruncher encounters
```

This will generate PBF tiles in path at `data/encounters/data/PBF` from raw tiles (expected to be served from `http://localhost:9090/{z},{x},{y}`).


## points-generator (dummy data)

--> GeoJSON --> mbtiles

This is used to prepare dummy data for the encounters and events layer for testing purposes.
It will first generate a number of point features (avoiding landmass for a slightly more realistic effect), in a GeoJSON file, then convert it to an mbtiles file (SQLite database). Each point has a random `datetime` timestamp property, as well as a random `type` ranging from 0 to 4.

The generated mbtiles file can then be used by the cruncher to generate individual PBF tiles.

```
node ./points-generator [dataset] [numFeatures] [maxZoom]
node ./points-generator events 40000 14
node  --max-old-space-size=8192 ./points-generator events 10000000 14
```



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

Set Mapbox token first:

```
export MAPBOX_ACCESS_TOKEN='pk....'
```

Run server:

```
npm run mbview [mbtiles path]
npm run mbview data/events/tiles.mbtiles

```

An inspector should be available at http://localhost:9000/

## Polygon layers Carto -> Mapbox preparation (deprecated)

Downloads CARTO tables from the SQL endpoint as GeoJSON that then get converted to mbtiles, to be uploaded as tilesets on Mapbox (the upload part is manual for now).

**DEPRECATED: We are now using consuming data from SQL tables on a CARTO instance directly, using CARTO's MVT endpoint** 

```
node polygon-layers/ [dataset_id]
node polygon-layers/ falklands_conservation
```

`dataset_id` is the same id as the ones used in workspaces/directory endpoint. Get a list of available datasets by typing
```
node polygon-layers/ --list
```


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

