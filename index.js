// mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsY2FzbyIsImEiOiJjaXVvYXB6M2gwMDF4MnRtd2c1b3lqdmh4In0.-qcuYFkQVE6U-TyfFswH9g#4.63/22.909/-78.738';
var map = new mapboxgl.Map({
  container: 'map',
  // style: 'mapbox://styles/mapbox/streets-v9'
  // style: 'mapbox://styles/danielcaso/cj49xom6535sn2spado3w5to6'
  style: 'http://localhost:8080/styles/vessels/style.json'
});

let t = 1000;

const frame = () => {
  const filters = ['>=', 't', t];
  map.setFilter('vessels', filters);
  t += 20;
  requestAnimationFrame(frame);
}

map.on('load', () => {
  // frame();
});
