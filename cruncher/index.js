const tileReduce = require('@mapbox/tile-reduce')
const path = require('path')
const fs = require('fs')

const name = process.argv[2]
const dest = `./data/${name}/pbf`
const zoom = parseInt(process.argv[3])
const bounds = (process.argv[4] === undefined) ? null : process.argv[4].split(',').map(i => parseInt(i))
const mbtiles = `./data/${name}/${name}.mbtiles`
console.log(mbtiles, zoom)

require('rimraf').sync(dest)
fs.mkdirSync(dest)

const CONFIG = {
  encounters: {
    fields: ['worldCoordinates', 'datetime']
  }
}

reduce()

function reduce() {
  tileReduce({
    bbox: bounds,
    zoom: 15,
    map: path.join(__dirname, '/map.js'),
    sources: [{
      name: name,
      mbtiles: mbtiles,
      layers: [name]
      // raw: true
    }],
    mapOptions: {
      dest: dest,
      config: CONFIG[name]
    }
  })
    .on('reduce', function(data, tile) {
      console.log(data, tile)
      console.log(data.encounters.encounters.features.length)
      // if (tile.error) {
      //   console.log(tile.error)
      // }
      // console.log('tile done', tile, data.features[0].properties)
      // console.log('tile done', tile, data.source[0].tags)
    })
    .on('end', function() {
      console.log('reduce complete')
    })
}
