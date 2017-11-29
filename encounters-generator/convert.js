const execSync = require('child_process').execSync

var source = process.argv[2] || 'data/encounters/encounters_2017_11_29.geojson'
console.log(source)
var maxZoom = 14

const path = './data/encounters/data'

execSync(`rm ${path}/encounters.mbtiles`)

const tippecanoe = `tippecanoe -o ${path}/encounters.mbtiles -l encounters --maximum-zoom=${maxZoom} --minimum-zoom=2 --no-feature-limit --no-tile-size-limit --drop-rate=0 ${source}`
console.log(tippecanoe)
const ex = execSync(tippecanoe)
console.log(ex.toString())
