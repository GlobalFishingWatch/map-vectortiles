const fs = require('fs')
const execSync = require('child_process').execSync;
const turfinside = require('turf-inside')
const turfpoint = require('turf-point')
const landmass = require('./landmass').features[0]

var numFeatures = parseInt(process.argv[2])

if (isNaN(numFeatures)) {
  numFeatures = 4000
}

const geoJSON = {
  "type": "FeatureCollection",
  "features": []
}

while (geoJSON.features.length < numFeatures) {
  var randomLat = (180 * Math.random()) - 90
  var randomLng = (360 * Math.random()) - 180
  var pt = turfpoint([randomLng, randomLat])
  if (turfinside(pt, landmass)) continue
  geoJSON.features.push({
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [
        randomLng,
        randomLat
      ]
    }
  })
}

fs.writeFileSync('./data/encounters/encounters.json', JSON.stringify(geoJSON))

execSync('rm ./data/encounters/encounters.mbtiles')

const tippecanoe = 'tippecanoe -o ./data/encounters/encounters.mbtiles -l encounters -zg ./data/encounters/encounters.json'
const ex = execSync(tippecanoe);
console.log(ex.toString())

//
