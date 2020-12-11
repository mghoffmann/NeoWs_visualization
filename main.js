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
            .attr('r', 3)
            .style('fill', 'cyan');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'cyan');

        d3.select("#svgBar").selectAll('rect.' + className)
            .style('fill', 'cyan');
    } else {
        d3.select('#svgCenter').selectAll('circle.' + className)
            .attr('r', 2)
            .style('fill', 'gray');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'black');

        d3.select('#svgBar').selectAll('rect.' + className)
            .style('fill', 'pink');
    }
}

function updateBar(neos, attribute) {
    let heights = neos.map(a => attribute == 'Diameter' ? a.estimated_diameter_max_km : a.absolute_magnitude_h);

    let barScale = d3.scaleBand().domain(heights).range([margin * 2, barWidth + margin]).paddingInner(.2);
    let heightScale = d3.scaleLinear().domain([d3.max(heights.map(a => parseInt(a))) * 1.04, 0]).range([margin, barHeight + margin]);
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
    let barLabels = [attribute == 'Diameter' ? 'Asteroid Diameter' : 'Asteroid Magnitude'];
    barChart.append('g').selectAll('text').data(barLabels).join('text')
        .attr('x', barWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateScatter(neos) {
    let closest = neos.map(n => n.getApproaches()).map(a => a == undefined ? null : a.reduce((a, b) => (a.id < b.id) ? a : b)).filter(a => a != null);
    let coords = closest.map(a => [a.miss_distance_km, a.relative_velocity_kph]);

    console.log(coords);
    console.log(coords.map(a => a[0]));
    let xScale = d3.scaleLinear().domain([0, d3.max(coords.map(a => parseInt(a[0]))) * 1.04]).range([margin * 2, scatterWidth + margin * 2]);
    let yScale = d3.scaleLinear().domain([d3.max(coords.map(a => parseInt(a[1]))) * 1.04, 0]).range([margin, scatterHeight + margin]);
    let scatterChart = d3.select('#svgScatter');
    scatterChart.append('g').selectAll('circle').data(coords).join('circle')
        .attr('class', (d, i) => 'ast' + i)
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 2)
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
        .call(d3.axisBottom().scale(xScale).tickFormat(d3.format('.1s')));
    scatterChart.append('g').attr('transform', 'translate(' + margin * 2 + ', 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(yScale).tickFormat(d3.format('.1s')));
    let scatterLabels = ['Asteroid Passing Velocity by Distance from Earth'];
    scatterChart.append('g').selectAll('text').data(scatterLabels).join('text')
        .attr('x', scatterWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateLine() {
    let sortedDates = Approach.ALL.map(a => a.date).sort((a, b) => a.getTime() - b.getTime())
    let minDate = sortedDates[0]
    let maxDate = sortedDates[sortedDates.length - 1]

    console.log(sortedDates.length)
    console.log(minDate)
    console.log(maxDate)

    let data = []

    let lineChart = d3.select('#svgLine');
    lineChart.append('path')
        .attr('d', d3.line()(data))
        .attr('stroke', 'black');
    let lineLabels = ['Asteroid Frequency Over Time'];
    lineChart.append('g').selectAll('text').data(lineLabels).join('text')
        .attr('x', lineWidth/2 + margin*2)
        .attr('y', 12)
        .text(d => d);
}

// Takes an array of NEO instances and adds rings to the earth chart for them.
function updateCenter(neos) {
    let dists = neos.map(n => n.getApproaches()).map(a => a == undefined ? null : d3.min(a.map(a => a.miss_distance_km))).filter(a => a != null);

    let xScale = d3.scaleLinear().domain([0, d3.max(dists.map(a => parseInt(a)))]).range([111, centerWidth - 50]);
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
        .attr('r', 3)
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

function updateInfo(neos) {
    //let infoSection = d3.select('#infoSection');
    //let neos = NEO.ALL.slice(0, 3);
    //console.log(neos);
    //infoSection.selectAll('div').data(neos).join('div')
    //    .html(function(d, i) { return '<h2>Asteroid ' + (i + 1) + '</h2><h4>Magnitude: ' + d.absolute_magnitude_h + '</h4><h4>Diameter: ' + d.estimated_diameter_max + '</h4>'; });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let CSVS_LOADED = false

function loadCSVs() {
    CSVS_LOADED = false
    // Constructing Approach and NEO instances interns them in static
    // members of their classes so no storage here is needed. See
    // Approach.js and NEO.js for how to access them.
    d3.csv("data/neos/approaches-2019-2022.csv", function (data) {
        return new Approach(data);
    }).then(approaches => {
        d3.csv("data/neos/neos-2019-2022.csv", function (data) {
                return new NEO(data);
            })
            .then(() => CSVS_LOADED = true)
    })
}

async function init() {
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
    centerChart.append('text')
        .attr('class', 'loading')
        .attr('x', centerWidth/2)
        .attr('y', centerHeight/2)
        .attr('font-size', 20)
        .text('Loading...');

    loadCSVs();

    while (!CSVS_LOADED) {
        console.log("Waiting for CSV load.")
        await sleep(1000);
    }

    d3.select('.loading').remove();
    
    currNeos = NEO.ALL.slice(0, 20);
    let barSelect = document.getElementById('barSelect')
    barSelect.onchange = function(event) {
        updateBar(currNeos, barSelect.value);
    }

    updateLine();
    updateCenter(currNeos);
    updateBar(currNeos, barSelect.value);
    updateScatter(currNeos);
    updateInfo(currNeos);

    let brushH = d3.brushX()
        .extent([
            [margin * 2, margin],
            [lineWidth + margin * 2, lineHeight + margin + 1]
        ])
        .on('end', () => {
            let x0 = d3.event.selection[0];
            let x1 = d3.event.selection[1];
            let currNeos = [];
            for (x of NEO.ALL) {
                let diff = new Date() - approachDate();
                let day = Math.floor(diff / (1000*60*60*24));
                if (day > x0 && day < x1) {
                    currNeos.push(x);
                }
            }

            updateCenter(currNeos);
            updateBar(currNeos);
            updateScatter(currNeos);
            updateInfo(currNeos);
        });
    d3.select('#svgLine').append("g").attr("class", "brush").call(brushH);

    let box1 = d3.select("#svgBrush1");
    box1.append('text').attr('transform', 'rotate(-90)')
        .attr('x', -150)
        .attr('y', 30)
        .attr('font-size', 18)
        .text('Diameter');
    let brush1 = d3.brushY()
        .extent([
            [13, 10],
            [37, 290]
        ])
        .on('end', () => {
            let x0 = d3.event.selection[0];
            let x1 = d3.event.selection[1];
            let asteroids = [];
            for (x of currNeos) {
                if (x.val > x0 && x.val < x1) {
                    asteroids.push(x);
                }
            }

            currNeos = asteroids;
            updateCenter(currNeos);
            updateBar(currNeos);
            updateScatter(currNeos);
            updateInfo(currNeos);
        });
    box1.append("g").attr("class", "brush").call(brush1);

    let box2 = d3.select("#svgBrush2");
    box2.append('text').attr('transform', 'rotate(-90)')
        .attr('x', -150)
        .attr('y', 30)
        .attr('font-size', 18)
        .text('Velocity');
    let brush2 = d3.brushY()
        .extent([
            [13, 8],
            [37, 292]
        ])
        .on('end', () => {
            let x0 = d3.event.selection[0];
            let x1 = d3.event.selection[1];
            let asteroids = [];
            for (x of currNeos) {
                if (x.val > x0 && x.val < x1) {
                    asteroids.push(x);
                }
            }

            currNeos = asteroids;
            updateCenter(currNeos);
            updateBar(currNeos);
            updateScatter(currNeos);
            updateInfo(currNeos);
        });
    box2.append("g").attr("class", "brush").call(brush2);
}