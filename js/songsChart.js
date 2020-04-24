class SongsChart extends Chart {

  initVis() {
    super.initVis();

    let vis = this;

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left / 3},${vis.config.margin.top / 3})`);
    // Define events and chart colours organized according to
    // the layout on the page
    vis.events      = ['',        'exp_nght', 'ya_worship'];
    vis.chartColors = ['#79a158', '#a19e97',  '#d18636'   ];

    // Horizontal bar chart: x is numerical, y is categorical
    vis.xValue = d => d.value;
    vis.yValue = d => d.key;

    vis.index = 0;
    let gs = d3.graphScroll()
        .container(d3.select('#container-1'))
        .graph(d3.selectAll('#container-1 #songs-chart'))
        .eventId('uniqueId1')  // namespace for scroll and resize events
        .sections(d3.selectAll('#container-1 .sections > div'))
        .offset(vis.gsOffset)
        .on('active', function(i) {
          console.log('Active index: ' + i);
          vis.index = i;
          if (vis.index < 3) { vis.update(); }
        });

    console.log('initVis!');
  };

  update() {
    let vis = this;

    let m = vis.config.margin

    vis.colorValue = vis.chartColors[vis.index];

    vis.dataToRender = [
      dataObject.getTopTenSongs(),
      dataObject.getTopTenSongsByEvent('exp_nght'),
      dataObject.getTopTenSongsByEvent('ya_worship')
    ][vis.index];

    vis.yScale = d3.scaleBand()
      .domain(vis.dataToRender.map(d => d.key))
      .range([0 + m.top, vis.height - m.bottom])
      .padding(0.2);
    vis.barHeight = vis.yScale.bandwidth();

    vis.xScale = d3.scaleLinear()
        .domain([0, dataObject.getTopTenSongs()[0].value])
        .range([0 + m.left, vis.width - m.right]);

    vis.render();
  }

  render() {
    let vis = this;

    // Render bars
    let bars = vis.g.selectAll('.song-bar')
        .data(vis.dataToRender);

    bars.enter().append('rect')
      .merge(bars)
        .attr('class', 'song-bar')
        .attr('height', vis.barHeight)
        .attr('x', 0)
        .attr('y', d => vis.yScale(vis.yValue(d)))
      .transition().duration(500)
        .attr('width', d => vis.xScale(vis.xValue(d)))
        .attr('fill', vis.colorValue);

    bars.exit().remove();

    // Render text
    let barText = vis.g.selectAll('.song-bar-label')
        .data(vis.dataToRender);

    barText.enter().append('text')
      .merge(barText)
        .attr('class', 'song-bar-label')
        .attr('x', 2)
        .attr('y', d => vis.yScale(vis.yValue(d)) + vis.barHeight / 2)
        .attr('dy', '.35em')
        .text(d => d.key + ': ' + d.value);
  }
}