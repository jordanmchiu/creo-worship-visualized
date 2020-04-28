class BandChart extends Chart {
  initVis() {
    super.initVis();

    let vis = this;

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left / 5},${vis.config.margin.top / 3})`);
    // Define events and chart colours organized according to
    // the layout on the page

    vis.dataToRender = dataObject.getBandNumbers();

    vis.primaryColor   = '#00b395';
    vis.secondaryColor = 'none';
    vis.colors         = [vis.primaryColor, vis.secondaryColor];

    vis.outerRadius = 50;
    vis.innerRadius = vis.outerRadius * 2 / 3;

    vis.pie = d3.pie()
      .value(d => d)
      .sort(null);
    vis.arc = d3.arc()
      .outerRadius(vis.outerRadius)
      .innerRadius(vis.innerRadius);

    let m = vis.config.margin;
    let gs = d3.graphScroll()
        .container(d3.select('#container-3'))
        .graph(d3.selectAll('#container-3 #band-chart'))
        .eventId('uniqueId3')  // namespace for scroll and resize events
        .sections(d3.selectAll('#container-3 .sections > div'))
        .offset(vis.gsOffset)
        .on('active', function(i) {
          // vis.internalIndex = i;
          vis.update(); 
        });
  };

  update() {
    let vis = this;

    // There's no data to update here, so move on immediately to the render function
    vis.render();
  }

  render() {
    let vis = this;

    // There are 9 different charts to render.

    let m = vis.config.margin;

    let pies = vis.g.selectAll('.pie')
        .data(vis.dataToRender);

    pies.enter().append('g')
      .merge(pies)
        .attr('class', 'pie')
        .attr('transform', (d, i) => vis.getPosition(i));

    pies.exit().remove();

    // let slices = pies.selectAll('path').data(d => vis.pie(d.values));
    // For whatever reason, the above call does not work, but the one below does.
    let slices = vis.g.selectAll('.pie').data(vis.dataToRender).selectAll('path')
      .data(d => vis.pie(d.values));

    slices.enter().append('path')
      .merge(slices)
        .attr('d', vis.arc)
        .attr('fill', (d, i) => vis.colors[i]);
    slices.exit().remove();
  }

  // Given a position in the array between [0,8], return the desired
  // position of the pie chart
  getPosition(i) {
    let vis = this;
    let xPos = (i % 3 === 0)
      ? vis.width / 4
      : (i % 3 === 1)
        ? vis.width / 2
        : vis.width * 3/4;
    let yPos = (i <= 2)
      ? vis.height / 4
      : (i <= 5)
        ? vis.height / 2
        : vis.height * 3/4;

    return 'translate(' + xPos + ',' + yPos + ')';
  }
}