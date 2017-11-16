var vtpbf = require('vt-pbf')
// var zlib = require('zlib');
var geojsonvt = require('geojson-vt')
var fs = require('fs')
var convert = require('globalfishingwatch-convert')

var convertTile = function(geoJson, z, convertFields) {
  geoJson.features.forEach(function(feature) {
    if (convertFields.datetime) {
      feature.properties.timeIndex = convert.getOffsetedTimeAtPrecision(feature.properties.datetime)
      delete feature.properties.datetime
    }
    // TODO the following fields will need to be stored as integers + handle quantization factor for each z level
    // because storing floats in PBF tiles is highly inefficient
    if (convertFields.latlon) {
      var world = convert.latLonToWorldCoordinates(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
      feature.properties.worldX = world.worldX
      feature.properties.worldY = world.worldY
    }
    // TODO add sigma/radius and weight/opacity for the vessels heatmap layer
  })
  return geoJson
}

module.exports = function(data, tile, writeData, done) {
  var x = tile[0]
  var y = tile[1]
  var z = tile[2]

  var geoJson = {
    type: 'FeatureCollection',
    features: []
  }

  const dataset = global.mapOptions.dataset
  const features = data[dataset][dataset].features
  geoJson.features = features

  try {
    if (global.mapOptions.config.convertFields) {
      geoJson = convertTile(geoJson, z, global.mapOptions.config.convertFields)
    }
    var tileIndex = geojsonvt(geoJson)
    var tileData = tileIndex.getTile(z, x, y)
    // var pbfout = zlib.gzipSync(vtpbf.fromGeojsonVt({ 'vessels': tileData }));
    var pbfout = vtpbf.fromGeojsonVt({ points: tileData })
    fs.writeFileSync(global.mapOptions.dest + '/' + z + ',' + x + ',' + y, pbfout)
    done(null, geoJson)
  } catch(e) {
  //   // done(null, {error: e})
  }
}
