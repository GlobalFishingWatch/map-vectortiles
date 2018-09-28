var fs = require('fs')
var rimraf = require('rimraf')
var http = require('http')
var execSync = require('child_process').execSync

var BASE_CARTO_URL = 'http://cartodb.skytruth.org/user/production/api/v2/sql?q={SQL}&format=geojson'
var TIPPECANOE_DEFAULT = 'tippecanoe -o {MBTILES} -f -zg --drop-densest-as-needed {GEOJSON}'

var DATASETS = {
  mpant: {
    sql: 'SELECT the_geom, the_geom_webmercator, cartodb_id, name, name as reporting_name, \'mpant:\' || mpa_id as region_id, \'mpant:\' || mpa_id as reporting_id FROM no_take_mpas_9_28_wgs_urls'
  },
  mparu: {
    sql: 'SELECT the_geom, the_geom_webmercator, cartodb_id, name, name as reporting_name, \'mparu:\' || mpa_id as region_id, \'mparu:\' || mpa_id as reporting_id FROM table_467_mpa_restricted_use_polygons'
  },
  eez: {
    // url: 'http://cartodb.skytruth.org/user/production/api/v2/sql?filename=eez_used_for_sampling_analysis_&q=SELECT+*+FROM+public.eez_used_for_sampling_analysis_&format=geojson&api_key=',
    // sql: 'SELECT cartodb_id, the_geom, the_geom_webmercator, geoname as name, \'eez:\' || mrgid as region_id, geoname as reporting_name, \'eez:\' || mrgid as reporting_id FROM eez_used_for_sampling_analysis_',
    sql: 'SELECT * FROM eez_used_for_sampling_analysis_',
    tippecanoe: 'tippecanoe -o {MBTILES} -f -Z 2 -z 12 --drop-densest-as-needed {GEOJSON}'
  },
  highseas: {
    sql: 'SELECT *, lower(regionid) as region_id FROM high_seas_pockets',
  },
  rfmo: {
    sql: 'SELECT the_geom, the_geom_webmercator, cartodb_id, \'rfmo:\' || rfb as reporting_id, \'rfmo:\' || rfb as region_id, rfb as reporting_name, rfb FROM rfmos_collated_polygons'
  },
  '6': {
    sql: 'select * from kkp_regions'
  },
  protectedplanet: {
    sql: 'select * from wdpa_apr_2018_marine_1_2'
  },
  mpatlas: {
    sql: 'SELECT the_geom, the_geom_webmercator, cartodb_id, name, name as reporting_id, \'mpa:\' || mpa_id as region_id FROM full_mpa_processed_10_20_wgs'
  },
  falklands_conservation: {
    sql: 'SELECT * FROM falkland_islands_conservation_zones'
  },
  mpa: {
    url: 'http://d1gam3xoknrgr2.cloudfront.net/current/WDPA_Apr2018-shapefile.zip',
    convert: function(callback, filename, dir) {
      var zipCmd = 'unzip -o -d ' + dir + ' ' + filename
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
  console.log('unknown dataset, use --list to see all available datesets')
  return
}

var dir = './data/polygon-layers/in/' + datasetKey + '/'
var filename = dir + datasetKey
var mbtilesFilename =  './data/polygon-layers/' + datasetKey + '.mbtiles'


rimraf(dir, function () {
  fs.mkdirSync(dir)
  start()
})

function start() {
  var file = fs.createWriteStream(filename)
  var url = dataset.url || BASE_CARTO_URL.replace('{SQL}', encodeURIComponent(dataset.sql))
  console.log('downloading ', url)
  http.get(url, function(response) {
    response.pipe(file)
    file.on('finish', function() {
      console.log('done')
      file.close()
      //file.close((dataset.convert) ? dataset.convert(tippecanoe, filename, dir) : tippecanoe(filename))
    })
  })
}

function tippecanoe(targetFile) {
  var command = (dataset.tippecanoe || TIPPECANOE_DEFAULT)
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

