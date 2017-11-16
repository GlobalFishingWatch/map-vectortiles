const tileReduce = require('@mapbox/tile-reduce')
const path = require('path')
const fs = require('fs')

const dataset = process.argv[2]
const dest = `./data/${dataset}/data/pbf`
const mbtiles = `./data/${dataset}/data/${dataset}.mbtiles`

require('rimraf').sync(dest)
fs.mkdirSync(dest)

/*
Precompute attributes for faster tile conversion on the client
datetime -> timeIndex
latlon -> worldY/worldX
sigma -> radius
weight -> opacity
*/
const CONFIG = {
  encounters: {
    convertFields: {datetime: true, latlon: true}
  }
}

reduce()

function reduce() {
  tileReduce({
    map: path.join(__dirname, '/map.js'),
    sources: [{
      name: dataset,
      mbtiles: mbtiles,
      // raw: true
    }],
    mapOptions: {
      dest: dest,
      config: CONFIG[dataset],
      dataset: dataset
    }
  })
    .on('reduce', function(data, tile) {
      // console.log('reduce')
      // console.log(tile)

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
