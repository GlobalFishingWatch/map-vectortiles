const tileReduce = require('@mapbox/tile-reduce')
const path = require('path')
const fs = require('fs')

const dataset = process.argv[2]
const dest = `./data/${dataset}/pbf`
const zoom = parseInt(process.argv[3])
const bounds = (process.argv[4] === undefined) ? null : process.argv[4].split(',').map(i => parseInt(i))
const mbtiles = `./data/${dataset}/${dataset}.mbtiles`
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
    zoom: 14,
    map: path.join(__dirname, '/map.js'),
    sources: [{
      dataset: dataset,
      mbtiles: mbtiles,
      layers: [dataset]
      // raw: true
    }],
    mapOptions: {
      dest: dest,
      config: CONFIG[dataset],
      dataset: dataset
    }
  })
    .on('reduce', function(data, tile) {
      console.log('reduce')
      console.log(data, tile)
      console.log(data)
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
