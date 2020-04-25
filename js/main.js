let oldWidth = 0;

let songsChart;
let artistsChart;

let dataObject;

function setup() {
  if (oldWidth === innerWidth) return;
  oldWidth = innerWidth;

  let width = d3.select('.chart').node().offsetWidth;
  let height = width;

  if (innerWidth <= 925) {
    width  = innerWidth;
    height = innerHeight * 0.7;
  }

  songsChart = new SongsChart({
    parentElement: '#container-1 #songs-chart',
    width: width,
    height: height,
  });

  artistsChart = new ArtistsChart({
    parentElement: '#container-2 #chart-2',
    width: width,
    height: height,
  });

  songsChart.initVis();
  artistsChart.initVis();

  // An admittedly hacky way to allow space at the bottom to make sure
  // you can scroll beyond the bottom edge of the page
  d3.select('#source')
      .style('margin-bottom', window.innerHeight - 450 + 'px')

  d3.select('#top-title')
      .style('margin-bottom', '150px');
}

d3.select(window).on('resize', () => {
  songsChart.update();
  artistsChart.update();
});

dataObject = new DataObject([
  './data/creo_worship_data.csv',
  './data/creo_worship_events.csv'
]);

dataObject.initialize().then(msg => {
  setup();
});


// Listen for event selector changes in the songs chart 
$(document).ready(function()
{
  $("#form-event-selector").change(function()
  {
    songsChart.selectedEvent = null;
    songsChart.internalIndex = null;
    songsChart.update();
  });
});