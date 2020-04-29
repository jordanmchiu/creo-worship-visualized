class BandChart extends Chart {
  initVis() {
    super.initVis();

    let vis = this;

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left / 5},${vis.config.margin.top / 3})`);
    // Define events and chart colours organized according to
    // the layout on the page

    vis.dataToRender = dataObject.getBandNumbers();
    vis.totalEvents  = dataObject.getNumberOfEvents();

    vis.primaryColor   = '#00b395';
    vis.secondaryColor = 'none';
    vis.colors         = [vis.primaryColor, vis.secondaryColor];

    vis.outerRadius = 60;
    vis.innerRadius = vis.outerRadius * 5 / 6;
    vis.iconSize    = vis.innerRadius * 2 / 3;

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

    // Append information icons to the centre of each donut
    let icons = vis.g.selectAll('.pie').data(vis.dataToRender).selectAll('image')
      .data(d => [d]);

    icons.enter().append('image')
      .merge(icons)
        .attr('xlink:href', d => vis.getIcon(d))
        .attr('x', -vis.iconSize / 2)
        .attr('y', -vis.iconSize)
        .attr('width', vis.iconSize)
        .attr('height', vis.iconSize);

    // Numbers indicate % of times we have an instrument
    let circleText = vis.g.selectAll('.pie').data(vis.dataToRender).selectAll('.circle-text')
      .data(d => [d]);

    let circleTextAppend = circleText.enter().append('text');
    circleTextAppend
      .merge(circleText)
        .attr('class', 'circle-text')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.35em')
    circleTextAppend.append('tspan')
      .merge(circleTextAppend)
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(d => (d.key === 'vox') ? 'backing' : d.key)
    circleTextAppend.append('tspan')
      .merge(circleTextAppend)
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(d => Math.round(d.values[0] * 100 / vis.totalEvents) + '%');
  }

  // Given a position in the array between [0,8], return the desired
  // position of the pie chart
  getPosition(i) {
    let vis = this;
    let xPos = (i % 3 === 0)
      ? vis.width / 6
      : (i % 3 === 1)
        ? vis.width / 2
        : vis.width * 5/6;
    let yPos = (i <= 2)
      ? vis.height / 6
      : (i <= 5)
        ? vis.height / 2
        : vis.height * 5/6;

    return 'translate(' + xPos + ',' + yPos + ')';
  }

  // Given a data point in the form:
  // { key: instrumentName,
  //   values: [count_played, count_not_played] }
  // return the file path of the desired icon
  getIcon(d) {
    let iconPath  = './assets/icons/';
    let fileName  = '';
    let extension = '.svg';
    switch(d.key) {
      case 'leader':
      case 'vox':
        fileName = 'microphone';
        break;
      case 'acoustic':
        fileName = 'acoustic';
        break;
      case 'keys':
        fileName = 'keys';
        break;
      case 'electric':
        fileName = 'electric';
        break;
      case 'drums':
        fileName = 'drums';
        break;
      case 'bass':
        fileName = 'bass';
        break;
      case 'strings':
        fileName = 'violin';
        break;
      default: // case: 'ukulele'
        fileName = 'ukulele';
    }
    return iconPath + fileName + extension;
  }
}