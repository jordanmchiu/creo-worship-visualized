class SongsChart extends Chart {

	initVis() {
		super.initVis();

		let vis = this;
		vis.r = 40;

	  vis.circle = vis.svg.append('circle')
	  		.attr('cx', 0)
	  		.attr('cy', 0)
	  		.attr('r', vis.r);

	  vis.colors = ['orange', 'purple', 'steelblue', 'pink', 'black'];
	  vis.positions = [ {cx: vis.width - vis.r, cy: vis.r},
	                    {cx: vis.r,         cy: vis.r},
	                    {cx: vis.width - vis.r, cy: vis.height - vis.r},
	                    {cx: vis.width/2,   cy: vis.height/2} ];
    vis.index = 0;
	  vis.pos = (i) => vis.positions[i];

	  let gs = d3.graphScroll()
	      .container(d3.select('#container-1'))
	      .graph(d3.selectAll('#container-1 #songs-chart'))
	      .eventId('uniqueId1')  // namespace for scroll and resize events
	      .sections(d3.selectAll('#container-1 .sections > div'))
	      .offset(vis.gsOffset)
	      .on('active', function(i) {
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

    vis.circle.transition().duration(1000)
    		.attr('cx', vis.pos(vis.index).cx)
    		.attr('cy', vis.pos(vis.index).cy)
      .transition()
        .style('fill', vis.colors[vis.index])
		// TODO
	}
}