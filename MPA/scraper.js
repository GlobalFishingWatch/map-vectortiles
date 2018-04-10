var fetch = require('node-fetch')
var fs = require('fs')
var token = require('./token.json').token

var pagesDest = './data/MPA/in/pages/'

var i = 0
var MAX_PAGES = 310
var couldntLoad = []

var fetchPage = function() {
  console.log('loading page', i)
  var url = 'https://api.protectedplanet.net/v3/protected_areas/search?marine=true&with_geometry=true&per_page=50&page=' +
    + i + '&token=' + token
  console.log(url)
  fetch(url)
    .then(function(response) { return response.text() })
    .then(function(responseText) {
      console.warn('success loading page', i)
      fs.writeFileSync(pagesDest + i + '.json', responseText)
      while (i < MAX_PAGES) {
        i++
        if (!fs.existsSync(pagesDest + i + '.json')) {
          fetchPage()
          break
        }
        console.log('file already exists, skipping page', i)
      }
      // return response.json()

    })
    .catch(function() {
      console.warn('failed to load page')
      couldntLoad.push(i)
    })
}

fetchPage(0)
