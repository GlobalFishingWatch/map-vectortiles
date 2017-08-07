const fetch = require('node-fetch')
const fs = require('fs')
const tilebelt = require('@mapbox/tilebelt')
const _ = require('lodash')
const rimraf = require('rimraf');

const path = process.argv[2] + '/tiles'
const startingTile = process.argv[3].split(',').map(i => parseInt(i))

const baseURL = 'https://api-dot-world-fishing-827.appspot.com/v2/tilesets/429-resample-v2-tms/2016-01-01T00:00:00.000Z,2017-01-01T00:00:00.000Z;'
const maxZoom = 10


// fish: z, x, y - tilebelt: x,y,z
const toGFishWTile = (tile) => [tile[2], tile[0], tile[1]]
const toTilebeltTile = (tile) => [tile[1], tile[2], tile[0]]

let currentZ = startingTile[0]

rimraf.sync(path)
fs.mkdirSync(path)


// const promises = []

const getNextZoom = (tiles) => {
  const zDir = path + '/' + currentZ;
  fs.mkdirSync(zDir)
  console.log(currentZ)
  console.log(tiles)
  tiles.map(tile => {
    const url = baseURL + toGFishWTile(tile).toString()
    // console.log(url)
    const x = tile[0]
    const y = tile[1]
    const xDir = zDir + '/' + x
    if (!fs.existsSync(xDir)){
      fs.mkdirSync(xDir);
    }
    return fetch(url)
    .then(res => {
      console.log(res.status)
      var dest = fs.createWriteStream(xDir + '/' + y)
      res.body.pipe(dest)
    })
    .catch(err => {
      // console.log(err)
    })
  })

  if (currentZ < maxZoom) {
    const newTiles = _.flatten(tiles.map(tile => tilebelt.getChildren(tile)))
    currentZ++;
    getNextZoom(newTiles);
  }
}

getNextZoom([toTilebeltTile(startingTile)]);
