// Handles highlighting for objects of the class name in each of the displays
//  className: The name of the class all of the markers share.
//  highlighted: Whether to highlight the markers or return them to normal.
function doHighlighting(className, highlight) {
    for (x of className.split(' ')) {
        if (x.includes('ast')) {
            className = x;
        }
    }
    if (highlight) {
        d3.select('#svgCenter').selectAll('circle.' + className)
            .attr('r', 8)
            .style('fill', 'cyan');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'cyan');

        d3.select("#svgBar").selectAll('rect.' + className)
            .style('fill', 'cyan');
    } else {
        d3.select('#svgCenter').selectAll('circle.' + className)
            .attr('r', 6)
            .style('fill', 'gray');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'black');

        d3.select('#svgBar').selectAll('rect.' + className)
            .style('fill', 'pink');
    }
}

function updateBar() {
    let heights = NEO.ALL.map(a => a.estimated_diameter_max);
    let barScale = d3.scaleBand().domain(heights).range([margin * 2, barWidth]).paddingInner(.2);
    let heightScale = d3.scaleLinear().domain([d3.max(heights) * 1.04, 0]).range([margin, barHeight + margin]);
    barChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(heights).join('rect')
        .attr('class', (_, i) => 'ast' + i)
        .attr('x', d => margin / 2 + barScale(d))
        .attr('y', margin)
        .attr('width', barScale.bandwidth())
        .attr('height', d => barHeight + margin - heightScale(d))
        .style('fill', 'pink')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .append('title')
        .text(d => d);
    barChart.append('g').attr('transform', 'translate(' + margin * 2 + ', 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(heightScale));
    let barLabels = ['Maximum Asteroid Diameter'];
    barChart.append('g').selectAll('text').data(barLabels).join('text')
        .attr('x', barWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateScatter() {
    let coords = NEO.ALL.map(a => [parseInt(a.approaches[0].miss_distance), parseInt(a.approaches[0].relative_velocity)]);
    console.log(coords);
    console.log(coords.map(a => a[0]));
    let xScale = d3.scaleLinear().domain([0, d3.max(coords.map(a => a[0])) * 1.04]).range([margin * 2, scatterWidth + margin * 2]);
    let yScale = d3.scaleLinear().domain([d3.max(coords.map(a => a[1])) * 1.04, 0]).range([margin, scatterHeight + margin]);
    let scatterChart = d3.select('#svgScatter');
    scatterChart.append('g').selectAll('circle').data(coords).join('circle')
        .attr('class', (d, i) => 'ast' + i)
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 6)
        .style('stroke', 'black')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .append('title')
        .text(d => 'dist: ' + d[0] + ' vel: ' + d[1]);
    scatterChart.append('g').attr('transform', 'translate(0, ' + (scatterHeight + margin) + ')')
        .attr('class', 'axis')
        .call(d3.axisBottom().scale(xScale));
    scatterChart.append('g').attr('transform', 'translate(' + margin * 2 + ', 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(yScale));
    let scatterLabels = ['Asteroid Passing Velocity by Distance from Earth'];
    scatterChart.append('g').selectAll('text').data(scatterLabels).join('text')
        .attr('x', scatterWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateLine(NEOS) {
    let neos = NEOS == null ? NEO.ALL : NEOS

    let data = []

    let lineChart = d3.select('#svgLine');
    lineChart.append('path')
        .attr('d', d3.line()(data))
        .attr('stroke', 'black');
    let lineLabels = ['Asteroid Frequency Over Time'];
    lineChart.append('g').selectAll('text').data(lineLabels).join('text')
        .attr('x', 765)
        .attr('y', 12)
        .text(d => d);
}

// Takes an array of NEO instances and adds rings to the earth chart for them.
function updateCenter() {
    let dists = NEO.ALL.map(a => parseInt(a.approaches[0].miss_distance));
    let xScale = d3.scaleLinear().domain([0, d3.max(dists)]).range([110, centerWidth - 50]);
    centerChart.append('g').selectAll('circle').data(dists).join('circle')
        .attr('cx', -2000)
        .attr('cy', centerHeight / 2)
        .attr('r', d => 2000 + xScale(d))
        .style('stroke', 'black')
        .style('fill', 'none');
    centerChart.append('g').selectAll('circle').data(dists).join('circle')
        .attr('class', (_, i) => 'ast' + i)
        .attr('cx', d => xScale(d))
        .attr('cy', centerHeight / 2)
        .attr('r', 6)
        .style('stroke', 'black')
        .style('fill', 'gray')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .append('title')
        .text(d => 'dist: ' + d3.format('.2e')(d).replace('+', ''));
}

function updateInfo() {
    //let infoSection = d3.select('#infoSection');
    //let neos = NEO.ALL.slice(0, 3);
    //console.log(neos);
    //infoSection.selectAll('div').data(neos).join('div')
    //    .html(function(d, i) { return '<h2>Asteroid ' + (i + 1) + '</h2><h4>Magnitude: ' + d.absolute_magnitude_h + '</h4><h4>Diameter: ' + d.estimated_diameter_max + '</h4>'; });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadCSVs() {
    // Constructing Approach and NEO instances interns them in static
    // members of their classes so no storage here is needed. See
    // Approach.js and NEO.js for how to access them.
    d3.csv("data/neos/approaches.csv", function (data) {
        return new Approach(data);
    }).then(approaches => {
        d3.csv("data/neos/neos.csv", function (data) {
            return new NEO(data);
        })
    })
}

function init() {

    loadCSVs();

    // add boxes for charts
    margin = 20;
    barChart = d3.select('#svgBar');
    barWidth = barChart.node().getBoundingClientRect().width - margin * 3;
    barHeight = barChart.node().getBoundingClientRect().height - margin * 3;
    barChart.append('rect')
        .attr('x', margin * 2)
        .attr('y', margin)
        .attr('width', barWidth)
        .attr('height', barHeight);

    scatterChart = d3.select('#svgScatter');
    scatterWidth = scatterChart.node().getBoundingClientRect().width - margin * 3;
    scatterHeight = scatterChart.node().getBoundingClientRect().height - margin * 3;
    scatterChart.append('rect')
        .attr('x', margin * 2)
        .attr('y', margin)
        .attr('width', scatterWidth)
        .attr('height', scatterHeight);

    lineChart = d3.select('#svgLine');
    lineWidth = lineChart.node().getBoundingClientRect().width - margin * 3;
    lineHeight = lineChart.node().getBoundingClientRect().height - margin * 3;
    lineChart.append('rect')
        .attr('x', margin * 2)
        .attr('y', margin)
        .attr('width', lineWidth)
        .attr('height', lineHeight);

    centerChart = d3.select('#svgCenter');
    centerWidth = centerChart.node().getBoundingClientRect().width;
    centerHeight = centerChart.node().getBoundingClientRect().height;
    centerChart.append('rect')
        .attr('x', 1)
        .attr('y', 1)
        .attr('width', centerWidth - 2)
        .attr('height', centerHeight - 2);
    centerChart.append('circle')
        .attr('class', 'earth')
        .attr('cx', 70)
        .attr('cy', centerHeight / 2)
        .attr('r', 40);

    updateBar();
    updateScatter();
    updateLine();
    updateCenter();
    updateInfo();

    let brushH = d3.brushX()
        .extent([
            [margin * 2, margin],
            [lineWidth + margin * 2, lineHeight + margin + 1]
        ])
        .on('end', () => {

        });
    d3.select('#svgLine').append("g").attr("class", "brush").call(brushH);

    let brush1 = d3.brushY()
        .extent([
            [13, 10],
            [37, 290]
        ])
        .on('end', () => {
            // update
        });
    d3.select("#svgBrush1").append("g").attr("class", "brush").call(brush1);
    let brush2 = d3.brushY()
        .extent([
            [13, 8],
            [37, 292]
        ])
        .on('end', () => {
            // update
        });
    d3.select("#svgBrush2").append("g").attr("class", "brush").call(brush2);
}