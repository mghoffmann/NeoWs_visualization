function updateBar() {
    let barChart = d3.select('#svgBar');
    barChart.append('rect')
        .attr('x', '20')
        .attr('y', '20')
        .attr('width', '460')
        .attr('height', '260');
    let bars = [240, 160, 110];
    let barScale = d3.scaleBand().domain(bars).range([40, 460]);
    barChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(bars).join('rect')
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

function updateScatter() {
    let scatterChart = d3.select('#svgScatter');
    scatterChart.append('rect')
        .attr('x', '20')
        .attr('y', '20')
        .attr('width', '460')
        .attr('height', '260');
    let circles = [[84, 144], [320, 180], [420, 104]];
    scatterChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('circle').data(circles).join('circle')
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
    updateBar();
    updateScatter();
}
