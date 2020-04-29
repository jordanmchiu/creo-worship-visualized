class TotalsChart extends Chart {
  initVis() {
    super.initVis();

    let vis = this;

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left / 5},${vis.config.margin.top / 3})`);
    // Define events and chart colours organized according to
    // the layout on the page
    vis.activeSections = ['unique_songs', 'total_songs', 'artists', 'team', 'guests', 'sets'];
    vis.numbersToRender = [
      dataObject.getNumberOfUniqueSongs(),
      dataObject.getNumberOfTotalSongs(),
      dataObject.getNumberOfUniqueArtists(),
      dataObject.getNumberOfBandMembers(),
      dataObject.getNumberOfEvents(),
      dataObject.getNumberOfGuestLeaders(),
      ''
    ];
    vis.textToRender = [
      'different songs played',
      'total songs sung',
      'artists covered',
      'different band members',
      'worship sets played',
      'guest leaders',
    ];

    let m = vis.config.margin;

    vis.yScale = d3.scalePoint()
      .domain(vis.activeSections)
      .range([0 + m.top * 5, vis.height - m.bottom * 5]);

    vis.internalIndex = 0;
    let gs = d3.graphScroll()
        .container(d3.select('#container-4'))
        .graph(d3.selectAll('#container-4 #totals-chart'))
        .eventId('uniqueId4')  // namespace for scroll and resize events
        .sections(d3.selectAll('#container-4 .sections > div'))
        .offset(vis.gsOffset)
        .on('active', function(i) {
          vis.internalIndex = i;
          vis.update(); 
        });
  };

  update() {
    let vis = this;

    vis.render();
  }

  render() {
    let vis = this;

    let m = vis.config.margin;

    // Render numbers
    let summaryNumber = vis.g.selectAll('.summary-text-number')
        .data(vis.numbersToRender);

    summaryNumber.enter().append('text')
      .merge(summaryNumber)
        .attr('class', 'summary-text-number')
        .attr('text-anchor', 'left')
        .attr('x', 20)
        .attr('y', (d, i) => vis.yScale(vis.activeSections[i]))
        .attr('dy', '.35em')
        .text((d, i) => vis.numbersToRender[i])
      .transition().duration(500)
        .style('opacity', (d, i) => vis.getOpacity(d,i));

    // Render text
    let summaryText = vis.g.selectAll('.summary-text')
        .data(vis.numbersToRender);

    summaryText.enter().append('text')
      .merge(summaryText)
        .attr('class', 'summary-text')
        .attr('text-anchor', 'left')
        .attr('x', vis.width / 3)
        .attr('y', (d, i) => vis.yScale(vis.activeSections[i]))
        .attr('dy', '.35em')
        .text((d, i) => vis.textToRender[i])
      .transition()
        .style('opacity', (d, i) => vis.getOpacity(d,i));
  }

  getOpacity(d, i) {
    let vis = this;
    if (vis.internalIndex >= vis.activeSections.length) {
      return '100%';
    } else if (i !== vis.internalIndex) {
      return '0%';
    } else {
      return '100%';
    }
  }
}