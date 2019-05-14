const fs = require('fs')
const execSync = require('child_process').execSync
const turfinside = require('@turf/inside')
const turfhelpers = require('@turf/helpers')
const landmass = require('./landmass').features[0]
var JSONStream = require( 'JSONStream' )

const dataset = process.argv[2]
const path = `./data/${dataset}`

var numFeatures = parseInt(process.argv[3])
if (isNaN(numFeatures)) {
  numFeatures = 40000
}

var maxZoom = parseInt(process.argv[4])
if (isNaN(maxZoom)) {
  maxZoom = 14
}

var DATE_START = new Date(2012,0,1).getTime()
var DATE_END = new Date(2016,11,31).getTime()
// var DATE_START = new Date(2010,0,1).getTime()
// var DATE_END = new Date(2012,0,1).getTime()
var dateInterval = DATE_END - DATE_START

var i = 0

const points = []

while (points.length < numFeatures) {
  var randomLat = (180 * Math.random()) - 90
  var randomLng = (360 * Math.random()) - 180
  var randomDatetime = DATE_START + Math.floor(dateInterval * Math.random())
  var pt = turfhelpers.point([randomLng, randomLat])
  if (turfinside(pt, landmass)) continue
  
  points.push({
    'type': 'Feature',
    'properties': {
      datetime: randomDatetime,
      series: i++,
      type: Math.floor(Math.random()*5)
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [
        randomLng,
        randomLat
      ]
    }
  })
}

execSync(`rm -f ${path}/data/${dataset}.mbtiles`)

const transformStream = JSONStream.stringify('{"type":"FeatureCollection","features":[', '\n,\n', ']}')
const outputStream = fs.createWriteStream(`${path}/data/${dataset}.json`)
transformStream.pipe(outputStream)
points.forEach((p, i) => { console.log(i); transformStream.write(p) })
outputStream.on('error', (a) => {
  console.log(a)
})  
transformStream.on('error', (a) => {
  console.log(a)
})  
transformStream.on('end', () => {
  console.log('end JSON stringify')
})  
outputStream.on('finish', () => {
  console.log('JSON done')
  // --drop-rate=0 : do not try to reduce the number of features at x levels below --maximum-zoom
  const tippecanoe = `tippecanoe -o ${path}/data/${dataset}.mbtiles -l ${dataset} --maximum-zoom=${maxZoom} --minimum-zoom=2 --no-feature-limit --no-tile-size-limit --drop-rate=0 ${path}/data/${dataset}.json`
  console.log(tippecanoe)
  const ex = execSync(tippecanoe)
  console.log(ex.toString())
})
transformStream.end()




