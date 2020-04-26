class ArtistsChart extends Chart {
  initVis() {
    super.initVis();

    let vis = this;

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left / 5},${vis.config.margin.top / 3})`);
    // Define events and chart colours organized according to
    // the layout on the page
    vis.groupBy      = ['plays',   'songs'];
    vis.chartColors  = ['#61b8c5', '#c1c763'];

    // Horizontal bar chart: y is numerical, x is categorical
    vis.yValue = d => d.value;
    vis.xValue = d => d.key;

    vis.index = 0;
    let gs = d3.graphScroll()
        .container(d3.select('#container-2'))
        .graph(d3.selectAll('#container-2 #artists-chart'))
        .eventId('uniqueId2')  // namespace for scroll and resize events
        .sections(d3.selectAll('#container-2 .sections > div'))
        .offset(vis.gsOffset)
        .on('active', function(i) {
          if (i < 2) {
            vis.internalIndex = i;
            vis.selectedGroup = vis.groupBy[vis.internalIndex];
          }
          vis.update(); 
        });
  };

  update() {
    let vis = this;

    let m = vis.config.margin;
    vis.colorValue = vis.chartColors[vis.internalIndex];
    vis.dataToRender = vis.selectedGroup === 'plays'
      ? dataObject.getTopFiveArtistsByPlays()
      : dataObject.getTopFiveArtistsBySongs();

    vis.xScale = d3.scaleBand()
      .domain(vis.dataToRender.map(d => d.key))
      .range([0, vis.width])
      .padding(0.2);
    vis.barWidth = vis.xScale.bandwidth();

    vis.yScale = d3.scaleLinear()
        .domain([0, dataObject.getTopFiveArtistsByPlays()[0].value])
        .range([vis.height, 0]);

    vis.render();
  }

  render() {
    let vis = this;

    let m = vis.config.margin;
    // Render bars
    let bars = vis.g.selectAll('.artist-bar')
        .data(vis.dataToRender);

    bars.enter().append('rect')
      .merge(bars)
        .attr('class', 'artist-bar')
        .attr('width', vis.barWidth)
        .attr('x', d => vis.xScale(vis.xValue(d)))
      .transition().duration(500)
        .attr('y', d => vis.yScale(vis.yValue(d)))
        .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
        .attr('fill', vis.colorValue);

    bars.exit().remove();

    // Render text
    let barText = vis.g.selectAll('.artist-bar-label')
        .data(vis.dataToRender);

    barText.enter().append('text')
      .merge(barText)
        .attr('class', 'artist-bar-label')
        .attr('text-anchor', 'left')
        .attr('transform', 'rotate(-90)')
        .attr('x', - vis.height + 10)
        .attr('y', d => vis.xScale(vis.xValue(d)) + vis.barWidth / 2)
        .attr('dy', '.35em')
        .text(d => d.key + ': ' + d.value);
  }
}