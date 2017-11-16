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
    if (convertFields.latlon) {
      var world = convert.latLonToWorldCoordinates(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
      feature.properties.worldX = world.worldX
      feature.properties.worldY = world.worldY
    }
    // TODO add sigma/radius and weight/opacity for the vessels heatmap layer
    // TODO the following fields might need to be stored as integers + handle quantization factor
    // because storing floats in PBF tiles is inefficient (tiles are heavier than they should).
    // The quantization logic and constant values should be in the globalfishingwatch-convert repo,
    // as this will be needed here as well as from the client.
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
