function updateBar(data) {
    let barChart = d3.select('#svgBar');
    let barScale = d3.scaleBand().domain(data).range([40, 460]);
    barChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(data).join('rect')
        .attr('x', d => 20 + barScale(d))
        .attr('y', d => 0)
        .attr('width', d => 100)
        .attr('height', d => d)
        .style('fill', 'pink');
    let barLabels = ['Maximum Asteroid Diameter'];
    barChart.append('g').selectAll('text').data(barLabels).join('text')
        .attr('x', 250)
        .attr('y', 12)
        .text(d => d);
}

function updateScatter(data) {
    let scatterChart = d3.select('#svgScatter');
    scatterChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('circle').data(data).join('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('r', 5);
    let scatterLabels = ['Asteroid Passing Velocity by Date'];
    scatterChart.append('g').selectAll('text').data(scatterLabels).join('text')
        .attr('x', 250)
        .attr('y', 12)
        .text(d => d);
}

function init() {
    // add boxes for charts
    d3.select('#svgBar').append('rect')
        .attr('x', '20')
        .attr('y', '20')
        .attr('width', '460')
        .attr('height', '260');
    d3.select('#svgScatter').append('rect')
        .attr('x', '20')
        .attr('y', '20')
        .attr('width', '460')
        .attr('height', '260');
    
    let bars = [240, 160, 110];
    let circles = [[84, 144], [320, 180], [420, 104]];
    updateBar(bars);
    updateScatter(circles);
}
