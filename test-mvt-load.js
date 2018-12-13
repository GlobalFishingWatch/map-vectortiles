const Pbf = require('pbf')
const VectorTile = require('@mapbox/vector-tile').VectorTile

const fs = require('fs')

const pbf = new Pbf(fs.readFileSync('./testtile-events'))
const vectorTile = new VectorTile(pbf)
console.log(pbf.length)

const layers = vectorTile.layers
const mainLayerName = Object.keys(layers)[0]
console.log('layer name:', mainLayerName)
const mainLayer = layers[mainLayerName]
console.log('layer length', mainLayer.length)
const aFeature = mainLayer.feature(0)
console.log('a feature:', aFeature.type)
console.log('a feature:', aFeature.properties)
console.log('a feature:bbox:', aFeature.bbox())
console.log( aFeature.toGeoJSON(5,27,16))
