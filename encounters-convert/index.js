const execSync = require('child_process').execSync
const csv2geojson = require('csv2geojson')
const fs = require('fs')

var source = process.argv[2] || 'data/encounters/encounters_20180111.csv'
var maxZoom = 14
const path = './data/encounters/data'
if (!fs.existsSync(path)) {
  fs.mkdirSync(path)
}
console.log(source)

// convert CSV to GeoJSON
csv2geojson.csv2geojson(fs.readFileSync(source, 'utf-8'), function(err, data) {
  if (err) {
    console.log(err)
  } else {
    const geoJSONSource = `${source}.json`
    fs.writeFileSync(geoJSONSource, JSON.stringify(data))
    if (fs.existsSync(`${path}/encounters.mbtiles`)) {
      execSync(`rm ${path}/encounters.mbtiles`)
    }
    const tippecanoe = `tippecanoe -o ${path}/encounters.mbtiles -l encounters --maximum-zoom=${maxZoom} --minimum-zoom=2 --no-feature-limit --no-tile-size-limit --drop-rate=0 ${geoJSONSource}`
    console.log(tippecanoe)

    const ex = execSync(tippecanoe)
    console.log(ex.toString())
  }


})



