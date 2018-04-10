var fs = require('fs')
var execSync = require('child_process').execSync

var pagesDest = './data/MPA/in/pages/'
var geoJson = {'type': 'FeatureCollection', 'features': []}
var geoJSONDest = './data/MPA/out/MPA.json'
var mbTilesDest = './data/MPA/out/MPA.mbtiles'


var appendFeatures = function(data) {
  data.protected_areas.forEach(function(originalFeature) {
    var feature = {
      type: 'Feature',
      properties: {
        name: originalFeature.name,
        id: originalFeature.id,
        countries: originalFeature.countries.map(function (country) {
          return country.name
        }).join(', '),
        type: originalFeature.designation.name,
        link: originalFeature.links.protected_planet
      },
      geometry: originalFeature.geojson.geometry
    }
    geoJson.features.push(feature)
  })
}

var makeMBTiles = function() {
  const tippecanoe = 'tippecanoe -o '+mbTilesDest+' -f -zg --drop-densest-as-needed '+ geoJSONDest

  const ex = execSync(tippecanoe)
  console.log(ex.toString())
}

var files = fs.readdirSync(pagesDest)

files.forEach(function(file) {
  try {
    var data = fs.readFileSync(pagesDest + file, 'utf-8')
    var json = JSON.parse(data)
    appendFeatures(json)
  } catch (e) {}
})
fs.writeFileSync(geoJSONDest, JSON.stringify(geoJson), {flag: 'w'})
makeMBTiles()

console.log('starting')
