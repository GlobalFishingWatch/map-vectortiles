var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
const fs = require('fs')
const rimraf = require('rimraf');

// const baseURL = 'https://api-dot-world-fishing-827.appspot.com/v2/tilesets/429-resample-v2-tms/2016-01-01T00:00:00.000Z,2017-01-01T00:00:00.000Z;'
const baseURL = 'http://localhost:8010/'

console.log('reduce start')

const dest = process.argv[2] + '/tiles'
const zoom = parseInt(process.argv[3])
const bounds =  process.argv[4].split(',').map(i => parseInt(i))

rimraf.sync(dest)
fs.mkdirSync(dest)

reduce();

function reduce() {
  tileReduce({
    // [w, s, e, n]
    // bbox: [-17.578125,34.452218,-4.042969,44.213710],
    // bbox: [-179, -89, 179, 89],
    bbox: bounds,
    zoom: zoom,
    map: path.join(__dirname, '/map.js'),
    sources: [{
      name: 'vessels',
      url: `${baseURL}{z},{x},{y}`,
      maxrate: 10,
      raw: true
    }],
    mapOptions: {
      dest: dest
    }
  })
  .on('reduce', function(data, tile) {
    if (tile.error) {
      console.log(tile.error)
    }
    // console.log('tile done', tile, data.features[0].properties)
    // console.log('tile done', tile, data.source[0].tags)
  })
  .on('end', function() {
    console.log('reduce complete');
  });
}
