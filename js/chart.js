class Chart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      width: _config.width || 600,
      height: _config.height || 500,
      margin: _config.margin || { top: 10, bottom: 10, right: 10, left: 20 },
    }
  }

  initVis() {
    let vis = this;

    vis.width = vis.config.width;
    vis.height = vis.config.height;

    // Set width and height of parent to allow vis to be fully seen
    // Define what the chart is
    vis.svg = d3.select(vis.config.parentElement)
    	.append('svg')
      	.attr('height', vis.height)
      	.attr('width', vis.width);

    vis.gsOffset = window.innerHeight / 5;
    // If there's anything else that relates to all components, we should handle it here.
  }
}