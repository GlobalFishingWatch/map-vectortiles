/* eslint-env browser */
/* global mapboxgl */

mapboxgl.accessToken = window.accessToken

/* eslint-disable quotes, indent */
var style = {
  "version": 8,
  "name": "Blank",
  "metadata": {
      "mapbox:autocomposite": true,
      "mapbox:type": "template",
      "mapbox:sdk-support": {
          "js": "0.46.0",
          "android": "6.0.0",
          "ios": "4.0.0"
      }
  },
  "center": [123, 0],
  "zoom": 5,
  "bearing": 0,
  "pitch": 0,
  "sources": {
      "composite": {
          "url": "mapbox://mapbox.mapbox-streets-v7",
          "type": "vector"
      },
      "events": {
        "type": "vector",
        "tiles": ["https://events-dot-world-fishing-827.appspot.com/datasets/indonesia/events/fishing/tiles/{z},{x},{y}"]
      },
    //   "events_before": {
    //     "type": "vector",
    //     "tiles": ["http://localhost:7071/{z}/{x}/{y}.pbf"]
    //   }
  },
  "sprite": "mapbox://sprites/enriquetuya/cjmls3scxr6r82sqqwr3gzoyi",
  "glyphs": "mapbox://fonts/enriquetuya/{fontstack}/{range}.pbf",
  "layers": [
      {
          "id": "background",
          "type": "background",
          "paint": {"background-color": "rgba(0,0,0,0)"}
      },
      {
          "id": "admin",
          "type": "line",
          "source": "composite",
          "source-layer": "admin",
          "layout": {},
          "paint": {}
      },
      {
          "id": "events",
          "type": "circle",
          "source": "events",
          "source-layer": "default",
          "layout": {},
          "paint": {
            "circle-radius": 3,
            "circle-color": "hsl(0, 100%, 77%)"
            }
        //   "paint": {
        //       "circle-color": [
        //           "match",
        //           ["get", "type"],
        //           0,
        //           "hsl(0, 98%, 52%)",
        //           1,
        //           "hsl(57, 85%, 54%)",
        //           2,
        //           "hsl(118, 96%, 50%)",
        //           3,
        //           "hsl(323, 96%, 53%)",
        //           "#000000"
        //       ]
        //   }
      },
    //   {
    //       "id": "events_before",
    //       "type": "circle",
    //       "source": "events_before",
    //       "source-layer": "events",
    //       "layout": {},
    //       "paint": {
    //           "circle-color": [
    //               "match",
    //               ["get", "type"],
    //               0,
    //               "hsl(0, 98%, 52%)",
    //               1,
    //               "hsl(57, 85%, 54%)",
    //               2,
    //               "hsl(118, 96%, 50%)",
    //               3,
    //               "hsl(323, 96%, 53%)",
    //               "#000000"
    //           ]
    //       }
    //   }
  ],
  "created": "2018-09-28T09:02:04.887Z",
  "id": "cjmls3scxr6r82sqqwr3gzoyi",
  "modified": "2018-09-28T09:07:05.966Z",
  "owner": "enriquetuya",
  "visibility": "private",
  "draft": false
}
/* eslint-enable quotes, indent */

var map = new mapboxgl.Map({
  container: 'map',
  style: style
  // style: 'mapbox://styles/danielcaso/cj49xom6535sn2spado3w5to6'
  // style: 'http://localhost:8080/styles/vessels/style.json'
})


var DATE_START = new Date(2010,0,1).getTime()
var DATE_END = new Date(2018,11,31).getTime()
var MONTH = 2592000000 * 12
var dateInterval = DATE_END - DATE_START

var timebar = document.querySelector('#timebar')
var width = timebar.getBoundingClientRect().width
var thumb = document.querySelector('#thumb')

var dragging = false
var d = DATE_START

thumb.addEventListener('mousedown', () => {
  dragging = true
})
document.addEventListener('mouseup', () => {
  dragging = false
  const end = d + MONTH;
  console.log(d, end, new Date(d))
  map.setFilter('events', [
    'all',
    // ['==', 'event_type', 'fishing']
    ['>', 'timestamp', d / 1000],
    ['<', 'timestamp', end / 1000],
  ])
//   map.setFilter('events_before', [
//     'all',
//     ['>', 'timestamp', d],
//     ['<', 'timestamp', d + MONTH],
//   ])
})
document.addEventListener('mousemove', (e) => {
  if (dragging === false) {
    return
  }
  const x = e.clientX - 5
  thumb.style.left = `${x}px`

  const r = x / width
  d = Math.round(DATE_START + dateInterval * r)
})

map.on('load', () => {
  console.log('map loaded')
  console.log(map.isSourceLoaded('events'))
  console.log(map.getLayer('events'))
})

map.addControl(new MapboxInspect());