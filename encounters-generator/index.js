const fs = require('fs')
const turfinside = require('turf-inside')
const turfpoint = require('turf-point')
const landmass = require('./landmass').features[0]

var numFeatures = parseInt(process.argv[2])

if (isNaN(numFeatures)) {
  numFeatures = 40000
}

const geoJSON = {
  "type": "FeatureCollection",
  "features": []
}

while (geoJSON.features.length < numFeatures) {
  var randomLat = (180 * Math.random()) - 90
  var randomLng = (360 * Math.random()) - 180
  var pt = turfpoint([randomLng, randomLat])
  // console.log(randomLat, randomLng)
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
