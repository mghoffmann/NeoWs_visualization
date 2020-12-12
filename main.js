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
            .attr('r', 4)
            .style('fill', 'cyan');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'cyan');

        d3.select("#svgBar").selectAll('rect.' + className)
            .style('fill', 'cyan');
    } else {
        d3.select('#svgCenter').selectAll('circle.' + className)
            .attr('r', 3)
            .style('fill', 'gray');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'black');

        d3.select('#svgBar').selectAll('rect.' + className)
            .style('fill', 'pink');
    }
}

// update bar chart
function updateBar(neos, attribute) {
    // unscaled bar heights
    let heights = neos.map(a => attribute == 'Diameter' ? (parseFloat(a.estimated_diameter_min_km) + parseFloat(a.estimated_diameter_max_km)) / 2 : parseFloat(a.absolute_magnitude_h));
    let ids = neos.map(a => a.id);
    // scale for bar widths
    let barScale = d3.scaleBand().domain(ids).range([margin * 2.5, barWidth + margin]).paddingInner(.2);
    // scale for bar heights
    let heightScale = d3.scaleLinear().domain([d3.max(heights) * 1.04, 0]).range([margin, barHeight + margin]);
    // update bars on chart
    barChart.selectAll('title').remove();
    barChart.select('.data').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(heights).join('rect')
        .attr('class', (_, i) => 'ast' + i)
        .attr('x', (_, i) => barScale(ids[i]))
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
        .text(d => d3.format('.3')(d));
    // update axis
    barChart.select('.axisY').call(d3.axisLeft().scale(heightScale));
    // update bar labels
    let barLabels = attribute == 'Diameter' ? ['Average Asteroid Diameter', 'Asteroid', 'Diameter (km)'] : ['Asteroid Magnitude', 'Asteroid', 'Relative Magnitude'];
    setLabels(barChart, barLabels, barWidth, barHeight);
}

// updates scatter chart
function updateScatter(neos) {
    // closest approaches
    let closest = neos.map(n => n.getApproaches()).map(a => a == undefined ? null : a.reduce((a, b) => (a.id < b.id) ? a : b)).filter(a => a != null);
    let coords = closest.map(a => [a.miss_distance_km, a.relative_velocity_kph]);

    // scale for x pos
    let xScale = d3.scaleLinear().domain([0, d3.max(coords.map(a => parseInt(a[0]))) * 1.01]).range([margin * 2, scatterWidth + margin * 2]);
    // scale for y pos
    let yScale = d3.scaleLinear().domain([d3.max(coords.map(a => parseInt(a[1]))) * 1.04, 0]).range([margin, scatterHeight + margin]);
    // update circles on chart
    scatterChart.selectAll('title').remove();
    scatterChart.select('.data').selectAll('circle').data(coords).join('circle')
        .attr('class', (_, i) => 'ast' + i)
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 3)
        .style('stroke', 'black')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .append('title')
        .text(d => 'dist: ' + d3.format('.3s')(d[0]) + ' vel: ' + d3.format('.3s')(d[1]));
    // update x axis
    scatterChart.select('.axisX').call(d3.axisBottom().scale(xScale).tickFormat(d3.format('.2s')));
    // update y axis
    scatterChart.select('.axisY').call(d3.axisLeft().scale(yScale).tickFormat(d3.format('.2s')));
    // update labels
    let scatterLabels = ['Asteroid Passing Velocity by Distance from Earth', 'Distance (km)', 'Velocity (kph)'];
    setLabels(scatterChart, scatterLabels, scatterWidth, scatterHeight);
}

// update line chart
function updateLine() {
    let data = ApproachAverages;
    let xScale = d3.scaleLinear().domain([0, 365]).range([margin*2, lineWidth + margin*2]);
    let yScale = d3.scaleLinear().domain([d3.max(data) * 1.04, 0]).range([margin, lineHeight + margin]);
    data = data.map((d, i) => [xScale(i), yScale(d)])

    // update line on chart
    lineChart.append('path')
        .attr('d', d3.line()(data))
        .attr('stroke', 'black');
    
    // update axes
    let dateRange = [new Date('2019').getTime(), new Date('2020').getTime()];
    let dateScale = d3.scaleLinear().domain(dateRange).range([margin*2, lineWidth + margin*2]);
    lineChart.append('g').attr('transform', 'translate(0, ' + (lineHeight + margin) + ')')
        .attr('class', 'axis')
        .call(d3.axisBottom().scale(dateScale).tickFormat(d3.timeFormat('%b %d')));
    lineChart.append('g').attr('transform', 'translate(' + margin*2 + ', 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(yScale));
    // update labels
    let lineLabels = ['Annual Asteroid Frequency', 'Day of the Year', 'Number of NEOs'];
    setLabels(lineChart, lineLabels, lineWidth, lineHeight);
}

// Takes an array of NEO instances and adds rings to the earth chart for them.
function updateCenter(neos) {
    // unscaled distances from earth
    let dists = neos.map(n => n.getApproaches()).map(a => a == undefined ? null : d3.min(a.map(a => a.miss_distance_km))).filter(a => a != null);
    d3.select('.loading').attr('style', dists.length == 0 ? 'display: auto;' : 'display: none;');

    // scale for x pos
    let xScale = d3.scaleLinear().domain([0, d3.max(dists.map(a => parseInt(a)))]).range([111, centerWidth - 50]);
    // update orbit circles on chart
    centerChart.selectAll('title').remove();
    centerChart.select('.orbits').selectAll('circle').data(dists).join('circle')
        .attr('cx', -2000)
        .attr('cy', centerHeight / 2)
        .attr('r', d => 2000 + xScale(d))
        .style('stroke', 'black')
        .style('fill', 'none');
    // update asteroid circles on chart
    centerChart.select('.data').selectAll('circle').data(dists).join('circle')
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
        .on('click', function(_, i) {
            updateInfo(neos[i]);
        })
        .append('title')
        .text(d => 'dist: ' + d3.format('.2e')(d).replace('+', ''));
}

// update info section
function updateInfo(neo) {
    infoSection.select('.name').text('Asteroid ' + neo.name);
    infoSection.select('.id').text('ID: ' + neo.id);
    infoSection.select('.diameter1').text('Min Diameter: ' + d3.format('.2e')(neo.estimated_diameter_min_km).replace('+', '') + ' km');
    infoSection.select('.diameter2').text('Max Diameter: ' + d3.format('.2e')(neo.estimated_diameter_max_km).replace('+', '') + ' km');
    infoSection.select('.magnitude').text('Magnitude: ' + d3.format('.3s')(neo.absolute_magnitude_h) + ' h');
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
    d3.csv(`data/neos/approaches-${years.start}-${years.end}.csv`, function (data) {
        return new Approach(data);
    }).then(approaches => {
        d3.csv(`data/neos/neos-${years.start}-${years.end}.csv`, function (data) {
                return new NEO(data);
            })
            .then(() => CSVS_LOADED = true)
    })
}

const csvYears = {
    "1 year": {
        start: 2019,
        end: 2022
    },
    "2 year": {
        start: 2018,
        end: 2023
    },
    "3 year": {
        start: 2017,
        end: 2024
    },
    "5 year": {
        start: 2015,
        end: 2026
    },
    "10 year": {
        start: 2010,
        end: 2031
    },
    "20 year": {
        start: 2000,
        end: 2040
    },
};
const years = csvYears["1 year"];

function chartSetup(chart, width, height) {
    chart.append('rect')
        .attr('x', margin * 2)
        .attr('y', margin)
        .attr('width', width)
        .attr('height', height);
    chart.append('g').attr('class', 'data');
    chart.append('g').attr('class', 'labels');
    chart.append('g').attr('transform', 'translate(0, ' + (height + margin) + ')')
        .attr('class', 'axis axisX');
    chart.append('g').attr('transform', 'translate(' + margin * 2 + ', 0)')
        .attr('class', 'axis axisY');
}

function setLabels(chart, labels, width, height) {
    labelX = [width/2 + margin*2, width/2 + margin*2, -height/2 - margin];
    labelY = [12, height + margin*2 + 12, 12];
    chart.select('.labels').selectAll('text').data(labels).join('text')
        .attr('transform', (_, i) => 'rotate(' + [0, 0, -90][i] + ')')
        .attr('x', (_, i) => labelX[i])
        .attr('y', (_, i) => labelY[i])
        .text(d => d);
}

async function init() {
    // adds basic elements to each chart
    margin = 20;
    barChart = d3.select('#svgBar');
    barWidth = barChart.node().getBoundingClientRect().width - margin * 3;
    barHeight = barChart.node().getBoundingClientRect().height - margin * 3;
    chartSetup(barChart, barWidth, barHeight);

    scatterChart = d3.select('#svgScatter');
    scatterWidth = scatterChart.node().getBoundingClientRect().width - margin * 3;
    scatterHeight = scatterChart.node().getBoundingClientRect().height - margin * 3;
    chartSetup(scatterChart, scatterWidth, scatterHeight);

    lineChart = d3.select('#svgLine');
    lineWidth = lineChart.node().getBoundingClientRect().width - margin * 3;
    lineHeight = lineChart.node().getBoundingClientRect().height - margin * 3;
    chartSetup(lineChart, lineWidth, lineHeight);

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
        .attr('x', centerWidth / 2)
        .attr('y', centerHeight / 2)
        .attr('font-size', 20)
        .text('Loading...');
    centerChart.append('g').attr('class', 'orbits');
    centerChart.append('g').attr('class', 'data');

    infoSection = d3.select('.infoSection');
    infoSection.append('h2').attr('class', 'name');
    let fields = ['id', 'magnitude', 'diameter1', 'diameter2'];
    for (x of fields) {
        infoSection.append('p').attr('class', x);
    }

    loadCSVs();
    while (!CSVS_LOADED) {
        console.log("Waiting for CSV load.")
        await sleep(1000);
    }

    //createAverages();

    d3.select('.loading').text('No Asteroids Found');

    // adds functionality to bar chart dropdown
    currNeos = NEO.ALL;
    let barSelect = document.getElementById('barSelect')
    barSelect.onchange = function () {
        updateBar(currNeos, barSelect.value);
    }

    // initial update for all charts
    updateCenter(currNeos);
    updateBar(currNeos, barSelect.value);
    updateScatter(currNeos);
    updateInfo(currNeos[0]);
    updateLine();
    
    // brush for attribute 1
    let box1 = d3.select("#svgBrush1");
    // brush for attribute 2
    let box2 = d3.select("#svgBrush2");

    // brush for frequency chart
    let brushH = d3.brushX()
        .extent([
            [margin * 2, margin],
            [lineWidth + margin * 2, lineHeight + margin + 1]
        ])
        .on('end', () => {
            box1.selectAll('.selection, .handle').attr('style', 'display: none;');
            box2.selectAll('.selection, .handle').attr('style', 'display: none;');
            let x0 = 365 * d3.event.selection[0] / lineWidth;
            let x1 = 365 * d3.event.selection[1] / lineWidth;
            currNeos = [];
            for (x of NEO.ALL) {
                let day = x.getApproaches()[0].date;
                let diff = day - new Date(day.getFullYear(), 0, 0);
                day = Math.floor(diff / (1000 * 60 * 60 * 24));
                if (day > x0 && day < x1) {
                    currNeos.push(x);
                }
            }

            updateCenter(currNeos);
            updateBar(currNeos, barSelect.value);
            updateScatter(currNeos);
        });
    d3.select('#svgLine').append("g").attr("class", "brush").call(brushH);

    box1.append('text').attr('transform', 'rotate(-90)')
        .attr('x', -150)
        .attr('y', 30)
        .attr('font-size', 18)
        .text('Diameter');
    let brush1 = d3.brushY()
        .extent([
            [13, 8],
            [37, 292]
        ])
        .on('end', () => {
            box2.selectAll('.selection, .handle').attr('style', 'display: none;');
            let x0 = d3.event.selection[0];
            let x1 = d3.event.selection[1];

            let yScale = d3.scaleLinear().domain([0, d3.max(currNeos.map(a => parseFloat(a.estimated_diameter_max_km)))]).range([290, 10]);
            let asteroids = [];
            for (x of currNeos) {
                let temp = yScale(parseFloat(x.estimated_diameter_max_km));
                if (temp > x0 && temp < x1) {
                    asteroids.push(x);
                }
            }

            updateCenter(asteroids);
            updateBar(asteroids, barSelect.value);
            updateScatter(asteroids);
        });
    box1.append("g").attr("class", "brush").call(brush1);

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
            box1.selectAll('.selection, .handle').attr('style', 'display: none;');
            let x0 = d3.event.selection[0];
            let x1 = d3.event.selection[1];
            
            let yScale = d3.scaleLinear().domain([0, d3.max(currNeos.map(a => parseFloat(a.getApproaches()[0].relative_velocity_kph)))]).range([290, 10]);
            let asteroids = [];
            for (x of currNeos) {
                let temp = yScale(parseFloat(x.getApproaches()[0].relative_velocity_kph));
                if (temp > x0 && temp < x1) {
                    asteroids.push(x);
                }
            }

            updateCenter(asteroids);
            updateBar(asteroids, barSelect.value);
            updateScatter(asteroids);
        });
    box2.append("g").attr("class", "brush").call(brush2);
}