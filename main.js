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
    }
    else {
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
    let heights = NEOS_GLOBAL.map(a => a.estimated_diameter_max);
    let barChart = d3.select('#svgBar');
    let barScale = d3.scaleBand().domain(heights).range([40, chartWidth]);
    let heightScale = d3.scaleLinear().domain([d3.max(heights) * 1.04, 0]).range([20, 280]);
    barChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(heights).join('rect')
        .attr('class', (_, i) => 'ast' + i)
        .attr('x', d => 5 + barScale(d))
        .attr('y', d => 0)
        .attr('width', d => 10)
        .attr('height', d => 280 - heightScale(d))
        .style('fill', 'pink')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .append('title')
        .text(d => d);
    barChart.append('g').attr('transform', 'translate(29.5, 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(heightScale));
    let barLabels = ['Maximum Asteroid Diameter'];
    barChart.append('g').selectAll('text').data(barLabels).join('text')
        .attr('x', chartWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateScatter() {
    let coords = NEOS_GLOBAL.map(a => [parseInt(a.approaches[0].miss_distance), parseInt(a.approaches[0].relative_velocity)]);
    console.log(coords);
    console.log(coords.map(a => a[0]));
    let xScale = d3.scaleLinear().domain([0, d3.max(coords.map(a => a[0])) * 1.04]).range([30, 480]);
    let yScale = d3.scaleLinear().domain([d3.max(coords.map(a => a[1])) * 1.04, 0]).range([20, 280]);
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
    scatterChart.append('g').attr('transform', 'translate(0, 279.5)')
        .attr('class', 'axis')
        .call(d3.axisBottom().scale(xScale));
    scatterChart.append('g').attr('transform', 'translate(29.5, 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(yScale));
    let scatterLabels = ['Asteroid Passing Velocity by Distance from Earth'];
    scatterChart.append('g').selectAll('text').data(scatterLabels).join('text')
        .attr('x', chartWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateLine(NEOS) {
    let neos = NEOS == null ? NEOS_GLOBAL : NEOS

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
    let centerChart = d3.select('#svgCenter');
    let dists = NEOS_GLOBAL.map(a => parseInt(a.approaches[0].miss_distance));
    let xScale = d3.scaleLinear().domain([0, d3.max(dists)]).range([110, 960]);
    centerChart.append('g').selectAll('circle').data(dists).join('circle')
        .attr('cx', -2000)
        .attr('cy', 340)
        .attr('r', d => 2000 + xScale(d))
        .style('stroke', 'black')
        .style('fill', 'none');
    centerChart.append('g').selectAll('circle').data(dists).join('circle')
        .attr('class', (_, i) => 'ast' + i)
        .attr('cx', d => xScale(d))
        .attr('cy', 340)
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
    //let neos = NEOS_GLOBAL.slice(0, 3);
    //console.log(neos);
    //infoSection.selectAll('div').data(neos).join('div')
    //    .html(function(d, i) { return '<h2>Asteroid ' + (i + 1) + '</h2><h4>Magnitude: ' + d.absolute_magnitude_h + '</h4><h4>Diameter: ' + d.estimated_diameter_max + '</h4>'; });
}

let NEOS_GLOBAL = {}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {

    let NEOs = [];
    for (dayResponse in DATA) {
        let neosForDay = constructNEOs(DATA[dayResponse]);
        for (i in neosForDay) {
            NEOs.push(neosForDay[i]);
        }
    }

    while (NEO.WAITING > 0) {
        // console.log(`Waiting for ${NEO.WAITING} requests.`)
        await sleep(100);
    }

    if (NEO.ASYNC_ERRORS.length > 0) {
        errorMsg = "Error(s) occurred while requesting data from NeoWS API.\n"
        errorMsg += NEO.ASYNC_ERRORS.join("\n")
        alert(errorMsg)

        // TODO: Handle the errors
    }

    NEOS_GLOBAL = NEOs;

    // add boxes for charts
    margin = 20;
    chartWidth = 460;
    chartHeight = 260;
    lineWidth = 1360;
    lineHeight = 260;
    d3.select('#svgBar').append('rect')
        .attr('x', margin + 10)
        .attr('y', margin)
        .attr('width', chartWidth - 10)
        .attr('height', chartHeight);
    d3.select('#svgScatter').append('rect')
        .attr('x', margin + 10)
        .attr('y', margin)
        .attr('width', chartWidth - 10)
        .attr('height', chartHeight);
    d3.select('#svgLine').append('rect')
        .attr('x', margin)
        .attr('y', margin)
        .attr('width', lineWidth)
        .attr('height', lineHeight);

    updateBar();
    updateScatter();
    updateLine();
    updateCenter();
    updateInfo();

    let brushH = d3.brushX()
        .extent([
            [20, 20],
            [1380, 280]
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

    // // This requests the NEOs from Jan. 1 2000 to Jan. 7 2000, inclusive.
    // // TODO: Use a request similar to this to feed data to the charts instead of the for loop above.
    // // This will require a loading screen or just empty charts to be shown, then updated in the callback.
    // requestNEOs(new Date(2000, 1, 1), new Date(2000, 1, 7),
    //     function (NEOs) {
    //         for (let n = 0; n < NEOs.length; n++) {
    //             console.log(NEOs[n])
    //         }
    //         NEOS_GLOBAL = NEOs;
    //     })

    // updateCenter(NEOs);
}