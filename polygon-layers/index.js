var fs = require('fs')
var rimraf = require('rimraf')
var http = require('http')
var execSync = require('child_process').execSync

var DATASETS = {
  eez: {
    url: 'http://cartodb.skytruth.org/user/production/api/v2/sql?filename=eez_used_for_sampling_analysis_&q=SELECT+*+FROM+public.eez_used_for_sampling_analysis_&format=geojson&api_key=',
    tippecanoe: 'tippecanoe -o {MBTILES} -f -Z 2 -z 12 --drop-densest-as-needed {GEOJSON}'
  },
  hsp: {
    url: 'http://cartodb.skytruth.org/user/production/api/v2/sql?filename=high_seas_pockets&q=SELECT+*+FROM+public.high_seas_pockets&format=geojson&api_key=',
    tippecanoe: 'tippecanoe -o {MBTILES} -f -zg --drop-densest-as-needed {GEOJSON}'
  },
  mpa: {
    url: 'http://d1gam3xoknrgr2.cloudfront.net/current/WDPA_Apr2018-shapefile.zip',
    convert: function(callback, filename, dir) {
      var zipCmd = 'unzip -o -d ' + dir + ' ' + filename;
      console.log(zipCmd)
      execSync(zipCmd)
      var jsonFilename = filename + '.json'
      var cmd = 'ogr2ogr -f "GeoJSON" -where "MARINE in (\'1\', \'2\')" ' +
        jsonFilename + ' ' + dir + 'WDPA_Apr2018-shapefile-polygons.shp'
      console.log(cmd)
      execSync(cmd)
      callback(jsonFilename)
    },
    tippecanoe: 'tippecanoe -o {MBTILES} -f -Z 2 -z 12 --drop-densest-as-needed {GEOJSON}'
  }
}

var arg = process.argv[2]

if (arg === '--list') {
  console.log(Object.keys(DATASETS))
  return
}

var datasetKey = process.argv[2]
var dataset = DATASETS[datasetKey]

if (dataset === undefined) {
  console.log('unknown dataset')
  return
}

var dir = './data/polygon-layers/in/' + datasetKey + '/'
var filename = dir + datasetKey
var mbtilesFilename =  './data/polygon-layers/' + datasetKey + '.mbtiles'

dataset.convert(tippecanoe, filename, dir)
return

rimraf(dir, function () {
  fs.mkdirSync(dir)
  start()
})

function start() {
  var file = fs.createWriteStream(filename)
  console.log('downloading ', dataset.url)
  http.get(dataset.url, function(response) {
    response.pipe(file)
    file.on('finish', function() {
      file.close((dataset.convert) ? dataset.convert(tippecanoe, filename, dir) : tippecanoe(filename))
    })
  })
}

function tippecanoe(targetFile) {
  var command = dataset.tippecanoe
    .replace('{GEOJSON}', targetFile)
    .replace('{MBTILES}', mbtilesFilename)

  console.log(command)
  execSync(command)
  upload()
}

function upload() {
  // TODO
  // https://www.mapbox.com/api-documentation/#uploads
}

