Run simple tilelive server (port 7070):
```
npm start
```

Run tileserver-gl (port 8080):
```
npm run tileserver-gl
```

Convert GeoJSON data to mbtiles:
```
npm run tippecanoe
```

#### Convert Mapbox style

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

#### geojson to mbtiles

```
brew install tippecanoe
tippecanoe -o data/vessels-xl.mbtiles data/vessels_xl.json
```
