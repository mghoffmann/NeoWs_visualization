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
            .style('fill', 'cyan');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'cyan');

        d3.select("#svgBar").selectAll('rect.' + className)
            .style('fill', 'cyan');
    } else {
        d3.select('#svgCenter').selectAll('circle.' + className)
            .style('fill', 'gray');

        d3.select('#svgScatter').selectAll('circle.' + className)
            .style('fill', 'black');

        d3.select('#svgBar').selectAll('rect.' + className)
            .style('fill', 'pink');
    }
}

// Fun fact: Earth is an ellipse and not a sphere. This is an average.
const EARTH_RADIUS_KM = 6367.5

// update bar chart
function updateBar(neos, attribute) {
    // unscaled bar heights
    let heights = neos.map(getBarHeights(attribute));
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
        .on('click', function (_, i) {
            updateInfo(neos[i], i);
        })
        .append('title')
        .text(d => d3.format('.3')(d));
    // update axis
    barChart.select('.axisY').call(d3.axisLeft().scale(heightScale));
    // update bar labels
    let barLabels = getBarLabels(attribute)

    setLabels(barChart, barLabels, barWidth, barHeight);
}

function getBarHeights(attribute) {
    switch (attribute) {
        case 'Diameter':
            return a => a.estimated_diameter_median_km
        case 'Magnitude':
            return a => a.absolute_magnitude_h
        default:
            break;
    }
}

function getBarLabels(attribute) {
    switch (attribute) {
        case 'Diameter':
            return ['Asteroid Diameter (median of estimates)', 'Asteroid', 'Diameter (km)']
        case 'Magnitude':
            return ['Asteroid Absolute Magnitude', 'Asteroid', 'Absolute Magnitude']
        default:
            break;
    }
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
        .on('click', function (_, i) {
            updateInfo(neos[i], i);
        })
        .append('title')
        .text(d => 'dist: ' + d3.format('.3s')(d[0]) + ' KM, vel: ' + d3.format('.3s')(d[1]) + " KPH");
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
    let xScale = d3.scaleLinear().domain([0, 365]).range([margin * 2, lineWidth + margin * 2]);
    let yScale = d3.scaleLinear().domain([d3.max(data) * 1.04, 0]).range([margin, lineHeight + margin]);
    data = data.map((d, i) => [xScale(i), yScale(d)])

    // update line on chart
    lineChart.append('path')
        .attr('d', d3.line()(data))
        .attr('stroke', 'black');

    // update axes
    let dateRange = [new Date('2019').getTime(), new Date('2020').getTime()];
    let dateScale = d3.scaleLinear().domain(dateRange).range([margin * 2, lineWidth + margin * 2]);
    lineChart.append('g').attr('transform', 'translate(0, ' + (lineHeight + margin) + ')')
        .attr('class', 'axis')
        .call(d3.axisBottom().scale(dateScale).tickFormat(d3.timeFormat('%b %d')));
    lineChart.append('g').attr('transform', 'translate(' + margin * 2 + ', 0)')
        .attr('class', 'axis')
        .call(d3.axisLeft().scale(yScale));
    // update labels
    let lineLabels = ['Asteroid Frequency per Month', 'Day of the Year', 'NEOs per day'];
    setLabels(lineChart, lineLabels, lineWidth, lineHeight);
}

// Takes an array of NEO instances and adds rings to the earth chart for them.
function updateCenter(neos) {

    // unscaled distances from earth
    let data = neos.map(n => ({
            miss: n.miss_distance_km,
            diameter: n.estimated_diameter_median_km
        }))
        .filter(a => a.miss != null || a.diameter != null);

    d3.select('.loading').attr('style', data.length == 0 ? 'display: auto;' : 'display: none;');

    // scale for x pos
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(data.map(a => a.miss))])
        .range([80, centerWidth - 5]);
    let MaxDiameter = d3.max(NEO.ALL.map(a => a.estimated_diameter_median_km))
    // scale for radius
    let rScale =
        d3.scaleLinear()
        .domain([d3.min(NEO.ALL.map(a => a.estimated_diameter_median_km)), MaxDiameter])
        .range([3, 20]);

    // update orbit circles on chart
    centerChart.selectAll('title').remove();
    centerChart.select('.orbits').selectAll('circle').data(data).join('circle')
        .attr('cx', -2980)
        .attr('cy', centerHeight / 2)
        .attr('r', d => 2980 + xScale(d.miss))
        .style('stroke', 'black')
        .style('fill', 'none');
    // update asteroid circles on chart
    let currentY = 0;
    let nextY = (radius) => {
        let oldY = currentY;
        currentY += radius * 2.15;
        if (currentY >= centerChart.node().getBoundingClientRect().height) {
            currentY = 0;
        }
        return oldY;
    }
    centerChart.select('.data').selectAll('circle').data(data).join('circle')
        .attr('class', (_, i) => 'ast' + i)
        .attr('cx', d => xScale(d.miss))
        .attr('cy', d => nextY(rScale(d.diameter) || 3)) // Move this asteroid down by double the previous one's radius
        .attr('r', d => rScale(d.diameter) || 3)
        .style('stroke', 'black')
        .style('fill', 'gray')
        .on('mouseover', function () {
            doHighlighting(d3.select(this).attr('class'), true)
        })
        .on('mouseout', function () {
            doHighlighting(d3.select(this).attr('class'), false)
        })
        .on('click', function (_, i) {
            updateInfo(neos[i], i);
        })
        .append('title')
        .text(d => 'dist: ' + d3.format('.2e')(d.miss).replace('+', '') + " KM");
}

// An array of arrays that defines the info panel.
// 0: A name to class the element that contains the field
// 1: A function that takes a value and converts it to a string for the user
// 2: The name of a field in NEO. Leave this out or give null if it's the same as the class name.
const InfoPanelMapping = [
    ['name', v => `Name: ${v}`],
    ['id', v => `NeoWS ID: <a href="https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=${v}" target="blank" title="View this object in JPL's small-body database">${v}</a>`],
    ['diameter', v => `Estimated Diameter: ${d3.format('.2e')(v).replace('+', '')} km`, 'estimated_diameter_median_km'],
    ['first_observation', v => `First observation: ${getPrettyDateString(new Date(v))}`, 'first_observation_date'],
    ['last_observation', v => `Last observation: ${getPrettyDateString(new Date(v))}`, 'last_observation_date'],
    ['magnitude', v => `<a href="https://en.wikipedia.org/wiki/Absolute_magnitude">Absolute Magnitude</a>: ${d3.format('.3s')(v)} h`, 'absolute_magnitude_h'],
    ['is_hazardous', v => `Potentially Hazardous: ${v? 'Yes': 'No' }`, 'is_potentially_hazardous'],
    ['closest_approach', v => `Closest approach: ${getPrettyDateString(v)}`, 'close_approach_date'],
    ['miss_distance', v => `Closest distance: ${d3.format('.2e')(v).replace('+', '')} km`, 'miss_distance_km'],
    ['orbital_period', v => `Orbital period: ${Math.floor(v)} day${Math.floor(v) == 1 ? '' : 's'}`],
]

// update info section with info on the given NEO
// and class the index'th mark on all the charts as selected
infoNEO = null;

function updateInfo(neo, index) {
    if (neo == null) {
        infoSection.node().innerHTML = "<h2>Cick an item in the charts to see details.</h2>"
        infoNEO = null;
        return;
    }
    // Recreate all the elements if they were nullified by the last update
    // or if this is the first update
    else if (infoNEO == null) {
        infoSection.node().innerHTML = "";
        for (mapping of InfoPanelMapping) {
            infoSection.append(mapping[0] == 'name' ? 'h2' : 'p').attr('class', mapping[0]);
        }
    }

    for (mapping of InfoPanelMapping) {
        let panelClass = mapping[0]
        let formatter = mapping[1]
        let propertyName = mapping[2] == null ? mapping[0] : mapping[2];

        infoSection.select(`.${panelClass}`).node().innerHTML = formatter(neo[propertyName]);
    }

    d3.selectAll('.info-selected')
        .style('stroke', 'black')
        .style('stroke-width', '1')
        .classed('info-selected', false)

    d3.selectAll(`.ast${index}`)
        .style('stroke', 'darkred')
        .style('stroke-width', '3')
        .classed('info-selected', true)
    infoNEO = neo;
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
    labelX = [width / 2 + margin * 2, width / 2 + margin * 2, -height / 2 - margin];
    labelY = [12, height + margin * 2 + 12, 12];
    chart.select('.labels').selectAll('text').data(labels).join('text')
        .attr('transform', (_, i) => 'rotate(' + [0, 0, -90][i] + ')')
        .attr('x', (_, i) => labelX[i])
        .attr('y', (_, i) => labelY[i])
        .text(d => d);
}

// These are set when the vertical brushes are used.
let minVelocityFilter = null;
let maxVelocityFilter = null;
let minDiameterFilter = null;
let maxDiameterFilter = null;

function updateBrushes(neos) {
    let diameters = neos.map(n => n.estimated_diameter_min_km)
    let minDiameter = d3.min(diameters)
    let maxDiameter = d3.max(diameters)

    let velocities = neos.map(n => n.closest_velocity_kph / (60 * 60))
    let minVelocity = d3.min(velocities)
    let maxVelocity = d3.max(velocities)

    let diameterBox = d3.select("#diameterBox").select('.brush')
    let dBoxBounds = diameterBox.node().getBoundingClientRect()

    let velocityBox = d3.select("#velocityBox").select('.brush')
    let vBoxBounds = velocityBox.node().getBoundingClientRect()


    let dScale = d3.scaleLinear()
        .domain([maxDiameter, minDiameter])
        .range([0, dBoxBounds.height]);

    d3.select("#diameterBox").selectAll('.axis').remove()
    d3.select("#diameterBox").append('g')
        .attr('transform', 'translate(35,7.5)')
        .attr('class', 'axis')
        .call(d3.axisLeft(dScale))
        .selectAll('g.tick')
        .style('pointer-events', 'none')


    let vScale = d3.scaleLinear()
        .domain([maxVelocity, minVelocity])
        .range([0, vBoxBounds.height]);

    d3.select("#velocityBox").selectAll('.axis').remove()
    d3.select("#velocityBox").append('g')
        .attr('transform', 'translate(35,7.5)')
        .attr('class', 'axis')
        .call(d3.axisLeft(vScale))
        .selectAll('g.tick')
        .style('pointer-events', 'none')
}

function filterForBrushing(currNeos) {
    let asteroids = []

    let dScale = d3.scaleLinear()
        .domain([d3.min(currNeos.map(a => a.estimated_diameter_median_km)), d3.max(currNeos.map(a => a.estimated_diameter_median_km))])
        .range([290, 10]);
    let vScale = d3.scaleLinear()
        .domain([0, d3.max(currNeos.map(a => a.closest_velocity_kph))])
        .range([290, 10]);

    for (n of currNeos) {
        let tempV = vScale(n.closest_velocity_kph);
        let tempD = dScale(n.estimated_diameter_median_km);
        if (minDiameterFilter && minVelocityFilter) {
            if (tempD >= minDiameterFilter && tempD <= maxDiameterFilter &&
                tempV >= minVelocityFilter && tempV <= maxVelocityFilter) {
                asteroids.push(n);
            }
        } else if (minDiameterFilter) {
            if (tempD >= minDiameterFilter && tempD <= maxDiameterFilter) {
                asteroids.push(n);
            }
        } else if (minVelocityFilter) {
            if (tempV >= minVelocityFilter && tempV <= maxVelocityFilter) {
                asteroids.push(n);
            }
        } else {
            throw "This function should not be called without setting min and max diameter and velocity filter variables."
        }
    }

    return asteroids;
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



    let earthOffset = -2920;
    let earthRadius = 3000; //  12,742
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
        .attr('cx', earthOffset)
        .attr('cy', centerHeight / 2)
        .attr('r', earthRadius)
    centerChart.append('text')
        .attr('x', 40)
        .attr('y', centerHeight / 2 + 7.5)
        .style("font-size", "20px")
        .attr('fill', 'blue')
        .text("Earth")
    centerChart.append('text')
        .attr('class', 'loading')
        .attr('x', centerWidth / 2)
        .attr('y', centerHeight / 2)
        .attr('font-size', 20)
        .text('Loading...');
    centerChart.append('g').attr('class', 'orbits');
    centerChart.append('g').attr('class', 'data');

    infoSection = d3.select('.infoSection');

    loadCSVs();
    while (!CSVS_LOADED) {
        console.log("Waiting for CSV load.")
        await sleep(1000);
    }

    //createAverages();

    d3.select('.loading').text('No Asteroids Found');

    // adds functionality to bar chart dropdown
    currNeos = NEO.ALL.sort(n => n.miss_distance_km);
    let barSelect = document.getElementById('barSelect')
    barSelect.onchange = function () {
        updateBar(currNeos, barSelect.value);
    }

    // initial update for all charts
    updateCenter(currNeos);
    updateBar(currNeos, barSelect.value);
    updateScatter(currNeos);
    updateInfo(null);
    updateLine();

    // brush for attribute 1
    let diameterBox = d3.select("#diameterBox");
    // brush for attribute 2
    let velocityBox = d3.select("#velocityBox");

    // brush for frequency chart
    let frequencyBrush = d3.brushX()
        .extent([
            [margin * 2, margin],
            [lineWidth + margin * 2, lineHeight + margin + 1]
        ])
        .on('end', () => {
            diameterBox.selectAll('.selection, .handle').attr('style', 'display: none;');
            velocityBox.selectAll('.selection, .handle').attr('style', 'display: none;');
            let x0 = (365 * d3.event.selection[0] / lineWidth) - margin;
            let x1 = (365 * d3.event.selection[1] / lineWidth) - margin;
            currNeos = [];
            for (x of NEO.ALL) {
                let day = x.getApproaches()[0].date;
                let diff = day - new Date(day.getFullYear(), 0, 0);
                day = Math.floor(diff / MILLISECONDS_PER_DAY);
                if (day > x0 && day < x1) {
                    currNeos.push(x);
                }
            }

            currNeos = currNeos.sort(a => a.miss_distance_km);

            updateCenter(currNeos);
            updateBar(currNeos, barSelect.value);
            updateScatter(currNeos);
            updateInfo(null, null);
            updateBrushes(currNeos);
        });

    let diameterBrush = d3.brushY()
        .extent([
            [13, 8],
            [37, 292]
        ])
        .on('end', () => {
            if (d3.event.selection.length < 2)
                return

            minDiameterFilter = d3.event.selection[0];
            maxDiameterFilter = d3.event.selection[1];

            let asteroids = filterForBrushing(currNeos);

            updateCenter(asteroids);
            updateBar(asteroids, barSelect.value);
            updateScatter(asteroids);
        });
    diameterBox.append("g").attr("class", "brush").call(diameterBrush);

    let velocityBrush = d3.brushY()
        .extent([
            [13, 8],
            [37, 292]
        ])
        .on('end', () => {
            if (d3.event.selection.length < 2)
                return

            minVelocityFilter = d3.event.selection[0];
            maxVelocityFilter = d3.event.selection[1];

            let asteroids = filterForBrushing(currNeos);

            updateCenter(asteroids);
            updateBar(asteroids, barSelect.value);
            updateScatter(asteroids);
        });
    velocityBox.append("g").attr("class", "brush").call(velocityBrush);


    d3.select('#svgLine').append("g").attr("class", "brush").call(frequencyBrush)
        // This makes the Random default Brush
        //  getMinMax() returns an array [ min, max ]
        .call(frequencyBrush.move, getMinMax());
}