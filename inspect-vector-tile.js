#!/usr/bin/env node

const Pbf = require('pbf')

const VectorTile = require('@mapbox/vector-tile').VectorTile

const fs = require('fs')

const tilePath = process.argv[2]

if (tilePath === undefined) {
  console.error('Omitted tile path. Use: ./inspect-vector-tile path/to/tile.pbf')
  process.exit(1)
}

console.log('Reading tile:', tilePath)

const pbf = new Pbf(fs.readFileSync(tilePath))
const vectorTile = new VectorTile(pbf)
console.log('pbf length:', pbf.length)

const layers = vectorTile.layers
const mainLayerName = Object.keys(layers)[0]
console.log('layer name:', mainLayerName)
const mainLayer = layers[mainLayerName]
console.log('layer length', mainLayer.length)
const aFeature = mainLayer.feature(0)
console.log('example feature type:', aFeature.type)
console.log('example feature:', aFeature.properties)
console.log('example feature:bbox:', aFeature.bbox())
console.log('example feature to GeoJSON')
console.log( aFeature.toGeoJSON(5,26,16))
