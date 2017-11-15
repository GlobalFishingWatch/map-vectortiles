var vtpbf = require('vt-pbf')
var zlib = require('zlib');
var geojsonvt = require('geojson-vt')
var fs = require('fs')

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
