// var vtpbf = require('vt-pbf')
// // var zlib = require('zlib');
// var geojsonvt = require('geojson-vt')
// var fs = require('fs')

module.exports = function(data, tile, writeData, done) {
  // var x = tile[0]
  // var y = tile[1]
  // var z = tile[2]
  // var zoom = z
  //
  // var geoJson = {
  //   type: 'FeatureCollection',
  //   features: []
  // }

  const dataset = global.mapOptions.dataset
  console.log(data)
  // const features = data[dataset][dataset].features
  done(null, data)

  // try {
  //   var tileIndex = geojsonvt(geoJson)
  //   var tileData = tileIndex.getTile(z, x, y)
  //   // var pbfout = zlib.gzipSync(vtpbf.fromGeojsonVt({ 'vessels': tileData }));
  //   var pbfout = vtpbf.fromGeojsonVt({ 'vessels': tileData })
  //   fs.writeFileSync(global.mapOptions.dest + '/' + z + ',' + x + ',' + y + '.pbf', pbfout)
  //   done(null, tileData)
  // } catch(e) {
  //   done(null, {error: e})
  // }
}
