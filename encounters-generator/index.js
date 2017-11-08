const fs = require('fs')
const execSync = require('child_process').execSync
const turfinside = require('turf-inside')
const turfpoint = require('turf-point')
const landmass = require('./landmass').features[0]

var numFeatures = parseInt(process.argv[2])
if (isNaN(numFeatures)) {
  numFeatures = 40000
}

var maxZoom = parseInt(process.argv[3])
if (isNaN(maxZoom)) {
  maxZoom = 14
}

const geoJSON = {
  'type': 'FeatureCollection',
  'features': []
}

while (geoJSON.features.length < numFeatures) {
  var randomLat = (180 * Math.random()) - 90
  var randomLng = (360 * Math.random()) - 180
  var pt = turfpoint([randomLng, randomLat])
  if (turfinside(pt, landmass)) continue
  geoJSON.features.push({
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Point',
      'coordinates': [
        randomLng,
        randomLat
      ]
    }
  })
}

const path = './data/encounters/data'

execSync(`rm ${path}/encounters.mbtiles`)

fs.writeFileSync(`${path}/encounters.json`, JSON.stringify(geoJSON))
// --drop-rate=0 : do not try to reduce the number of features at x levels below --maximum-zoom
const tippecanoe = `tippecanoe -o ${path}/encounters.mbtiles -l encounters --maximum-zoom=${maxZoom} --minimum-zoom=2 --no-feature-limit --no-tile-size-limit --drop-rate=0 ${path}/encounters.json`
console.log(tippecanoe)
const ex = execSync(tippecanoe)
console.log(ex.toString())
