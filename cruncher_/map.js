var PelagosClient = require('./PelagosClient')
var vtpbf = require('vt-pbf');
// var zlib = require('zlib');
var geojsonvt = require('geojson-vt');
const fs = require('fs')

// Expressed in ms, for example 86400000 is 1 day (24*60*60*1000)
var PLAYBACK_PRECISION = 86400000;
var TIMELINE_OVERALL_START_DATE = new Date(Date.UTC(2012, 0, 1));
var VESSELS_HEATMAP_STYLE_ZOOM_THRESHOLD = 6;
var VESSELS_MINIMUM_RADIUS_FACTOR = .25;
var VESSELS_MINIMUM_OPACITY = 0.5;

var getWorldCoordinates = function(lat, lng) {
  var x = (lng + 180) / 360 * 256;
  var y = ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 0)) * 256;
  return [x, y];
};

var getTimeAtPrecision = function(timestamp) {
  return Math.floor(timestamp / PLAYBACK_PRECISION);
}
var TIMELINE_OVERALL_START_DATE_OFFSET = getTimeAtPrecision(TIMELINE_OVERALL_START_DATE.getTime());

var getOffsetedTimeAtPrecision = function(timestamp) {
  return Math.max(0, getTimeAtPrecision(timestamp) - TIMELINE_OVERALL_START_DATE_OFFSET);
}

var getZoomFactorRadiusRenderingMode = function(zoom) {
  return (zoom < VESSELS_HEATMAP_STYLE_ZOOM_THRESHOLD) ? 0.3 : 0.15;
}
var getZoomFactorRadius = function(zoom) {
  // return (zoom - 1) ** 2.5;
  return Math.pow(zoom - 1, 2.5)
}

var getRadius = function(sigma, zoomFactorRadiusRenderingMode, zoomFactorRadius) {
  var radius = zoomFactorRadiusRenderingMode * Math.max(0.8, 2 + Math.log(sigma * zoomFactorRadius));
  radius = Math.max(VESSELS_MINIMUM_RADIUS_FACTOR, radius);
  return radius;
};

var getOpacity = function(weight, zoomFactorOpacity) {
  var opacity = 3 + Math.log(weight * zoomFactorOpacity);
  //  avoid negative values, check why that happens
  opacity = Math.max(0, opacity);
  opacity = 3 + Math.log(opacity);
  opacity = 0.1 + (0.2 * opacity);
  opacity = Math.min(1, Math.max(VESSELS_MINIMUM_OPACITY, opacity));
  return opacity;
}



module.exports = function(data, tile, writeData, done) {

  var x = tile[0];
  var y = tile[1];
  var z = tile[2];
  var zoom = z;

  // var zoomFactorOpacity = ((zoom - 1) ** 3.5) / 1000;
  var zoomFactorOpacity = Math.pow(zoom - 1, 3.5) / 1000;
  var zoomFactorRadius = getZoomFactorRadius(zoom);
  var zoomFactorRadiusRenderingMode = getZoomFactorRadiusRenderingMode(zoom);

  var pc = new PelagosClient();
  pc.request = {
    response: data.vessels.buffer
  };
  pc.resolve = function(data) {

    var geoJson = {
      type: 'FeatureCollection',
      features: []
    };
    for (var i = 0, l = data.longitude.length; i < l; i++) {
      var frameIndex = getOffsetedTimeAtPrecision(data.datetime[i]);
      // var frameIndex = data.datetime[i];
      var opacity = getOpacity(data.weight[i], zoomFactorOpacity);
      var radius = getRadius(data.sigma[i], zoomFactorRadiusRenderingMode, zoomFactorRadius);
      var woorldCoords = getWorldCoordinates(data.latitude[i], data.longitude[i]);
      var worldX = woorldCoords[0];
      var worldY = woorldCoords[1];

      var pt = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            data.longitude[i],
            data.latitude[i]
          ]
        },
        properties: {
          category: data.category[i],
          series: data.series[i],
          seriesgroup: data.seriesgroup[i],
          t: frameIndex,
          opacity: Math.round(opacity * 8),
          radius: Math.round(radius * 8),
          worldX: Math.round(worldX * 4),
          worldY: Math.round(worldY * 4)
        }
      }
      geoJson.features.push(pt)
    }
    try {
      var tileIndex = geojsonvt(geoJson);
      var tileData = tileIndex.getTile(z, x, y);
      // var pbfout = zlib.gzipSync(vtpbf.fromGeojsonVt({ 'vessels': tileData }));
      var pbfout = vtpbf.fromGeojsonVt({ 'vessels': tileData });
    } catch(e) {
      done(null, {error: e})
    }
    fs.writeFileSync(global.mapOptions.dest + '/' + z + ',' + x + ',' + y + '.pbf', pbfout)
    done(null, tileData);
  }
  pc.reject = function(data) {
    done(null);
  }
  pc.handleData();
};
