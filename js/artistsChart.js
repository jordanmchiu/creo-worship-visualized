class ArtistsChart extends Chart {
  initVis() {
    super.initVis();

    let vis = this;

    vis.colors = ['orange', 'purple', 'steelblue', 'pink', 'black'];
    vis.index = 0;

    let w = vis.width;
    let h = vis.height;
    vis.dArray = [
        [[w/4, h/4], [w*3/4, h/4],  [w*3/4, h*3/4], [w/4, h*3/4]],
        [[0, 0],     [w*3/4, h/4],  [w*3/4, h*3/4], [w/4, h*3/4]],
        [[w/2, h/2], [w, h/4],      [w, h],         [w/4, h]],
        [[w/2, h/2], [w, h/4],      [w, h],         [w/4, h]],
        [[w/2, h/2], [w, h/2],      [0, 0],         [w/4, h/2]],
        [[w/2, h/2], [0, h/4],      [0, h/2],         [w/4, 0]],
      ].map(function(d){ return 'M' + d.join(' L ') });

    vis.path = vis.svg.append('path');

    let gs2 = d3.graphScroll()
        .container(d3.select('#container-2'))
        .graph(d3.selectAll('#container-2 #chart-2'))
        .eventId('uniqueId2')  // namespace for scroll and resize events
        .sections(d3.selectAll('#container-2 .sections > div'))
        .offset(vis.gsOffset)
        .on('active', function(i){
          vis.index = i;
          vis.update();
        });

    console.log('initVis!');
  };

  update() {
    let vis = this;

    // TODO

    vis.render();
  }

  render() {
    let vis = this;

    vis.path.transition().duration(1000)
        .attr('d', vis.dArray[vis.index])
        .style('fill', vis.colors[vis.index])
    // TODO
  }
}