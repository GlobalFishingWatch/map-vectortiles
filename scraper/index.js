const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const tilebelt = require('@mapbox/tilebelt')
const tilecover = require('@mapbox/tile-cover');
const bboxPolygon = require('turf-bbox-polygon');
const _ = require('lodash')
const rimraf = require('rimraf');


// example : node ./scraper data 4 -17.578125,34.452218,-4.042969,44.213710
const dest = process.argv[2] + '/rawTiles'
const startZoom = parseInt(process.argv[3])
// const startingTile = process.argv[3].split(',').map(i => parseInt(i))
const bounds =  process.argv[4].split(',').map(i => parseInt(i))
const getHigherZoomLevels = process.argv[5] === 'getHigherZoomLevels'

const baseURL = 'https://api-dot-world-fishing-827.appspot.com/v2/tilesets/429-resample-v2-tms/2016-01-01T00:00:00.000Z,2017-01-01T00:00:00.000Z;'
const maxZoom = 10


// fish: z, x, y - tilebelt: x,y,z
const toGFishWTile = (tile) => [tile[2], tile[0], tile[1]]
const toTilebeltTile = (tile) => [tile[1], tile[2], tile[0]]


rimraf.sync(dest)
fs.mkdirSync(dest)


const bboxGeom = bboxPolygon(bounds)
const startingTiles = tilecover.tiles(bboxGeom.geometry, {
  min_zoom: startZoom,
  max_zoom: startZoom
})

var currentZ = startZoom

const getNextZoom = (tiles) => {
  // const zDir = dest + '/' + currentZ;
  // fs.mkdirSync(zDir)
  console.log(currentZ)
  console.log(tiles)
  tiles.map(tile => {
    const url = baseURL + toGFishWTile(tile).toString()
    // console.log(url)
    const x = tile[0]
    const y = tile[1]
    // const xDir = zDir + '/' + x
    // if (!fs.existsSync(xDir)){
    //   fs.mkdirSync(xDir);
    // }
    return fetch(url)
    .then(res => {
      // var dest = fs.createWriteStream(xDir + '/' + y)
      var file = path.join(dest, currentZ + ',' + x + ',' + y)
      var dest = fs.createWriteStream(file)
      res.body.pipe(dest)
    })
    .catch(err => {
      console.log(err)
    })
  })

  if (getHigherZoomLevels && currentZ < maxZoom) {
    const newTiles = _.flatten(tiles.map(tile => tilebelt.getChildren(tile)))
    currentZ++;
    getNextZoom(newTiles);
  }
}

getNextZoom(startingTiles);
