function updateBar(data) {
    let barChart = d3.select('#svgBar');
    let barScale = d3.scaleBand().domain(data).range([40, chartWidth]);
    barChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('rect').data(data).join('rect')
        .attr('x', d => 20 + barScale(d))
        .attr('y', d => 0)
        .attr('width', d => 100)
        .attr('height', d => d)
        .style('fill', 'pink')
        .on('mouseover', function () {
            d3.select(this).style('fill', 'cyan');
        })
        .on('mouseout', function () {
            d3.select(this).style('fill', 'pink');
        });
    let barLabels = ['Maximum Asteroid Diameter'];
    barChart.append('g').selectAll('text').data(barLabels).join('text')
        .attr('x', chartWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateScatter(data) {
    let scatterChart = d3.select('#svgScatter');
    scatterChart.append('g').attr('transform', 'translate(0, 280) scale(1, -1)').selectAll('circle').data(data).join('circle')
        .attr('cx', d => d[0])
        .attr('cy', d => d[1])
        .attr('r', 6)
        .style('stroke', 'black')
        .on('mouseover', function () {
            d3.select(this)
                .attr('r', 8)
                .style('fill', 'cyan');
        })
        .on('mouseout', function () {
            d3.select(this)
                .attr('r', 6)
                .style('fill', 'black');
        });
    let scatterLabels = ['Asteroid Passing Velocity by Distance from Earth'];
    scatterChart.append('g').selectAll('text').data(scatterLabels).join('text')
        .attr('x', chartWidth / 2 + margin)
        .attr('y', 12)
        .text(d => d);
}

function updateLine(data) {
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
function updateCenter(NEOs) {

}

let NEOS_GLOBAL = {}

function init() {
    // add boxes for charts
    margin = 20;
    chartWidth = 460;
    chartHeight = 260;
    lineWidth = 1360;
    lineHeight = 260;
    d3.select('#svgBar').append('rect')
        .attr('x', margin)
        .attr('y', margin)
        .attr('width', chartWidth)
        .attr('height', chartHeight);
    d3.select('#svgScatter').append('rect')
        .attr('x', margin)
        .attr('y', margin)
        .attr('width', chartWidth)
        .attr('height', chartHeight);
    d3.select('#svgLine').append('rect')
        .attr('x', margin)
        .attr('y', margin)
        .attr('width', lineWidth)
        .attr('height', lineHeight);

    let bars = [240, 160, 110];
    let circles = [
        [84, 144],
        [320, 180],
        [420, 104]
    ];
    let line = [
        [20, 60],
        [200, 80],
        [400, 134],
        [800, 111],
        [1160, 67],
        [1380, 204]
    ];
    updateBar(bars);
    updateScatter(circles);
    updateLine(line);

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

    let NEOs = [];
    for (dayResponse in DATA) {
        let neosForDay = constructNEOs(DATA[dayResponse]);
        for (i in neosForDay) {
            NEOs.push(neosForDay[i]);
        }
    }

    NEOS_GLOBAL = NEOs;

    // // This requests the NEOs from Jan. 1 2000 to Jan. 7 2000, inclusive.
    // // TODO: Use a request similar to this to feed data to the charts instead of the for loop above.
    // // This will require a loading screen or just empty charts to be shown, then updated in the callback.
    // requestNEOs(new Date(2000, 1, 1), new Date(2000, 1, 7),
    //     function (NEOs) {
    //         for (let n = 0; n < NEOs.length; n++) {
    //             // console.log(NEOs[n])
    //         }
    //         NEOS_GLOBAL = NEOs;
    //     })

    // updateCenter(NEOs);

    // var start = new Date(2000, 0, 1);
    // var end   = new Date(2000, 0, 21);
    
    // let last = new Date(start.getTime())
    // var d = new Date(last.getTime())
    // d.setDate(d.getDate() + 10)
    // for (d; d <= end; d.setDate(d.getDate() + 10)) {
    //     // I'm planning on making the average calculation based on a boolean
    //     //  so what I mean is the bool will only be true when I want 
    //     //  to save that average and start over on the next value
    //     //  Ex:  
    //     //    Year:  d.getMonth() === 0
    //     //    Lunar: getMoonPhase(d) === 0
    //     //    Month: d.getDate() === 0
    //     //    Week:  d.getDay() === 0

    //     requestNEOs(last, d, (NEOs) => console.log(NEOs) )

    //     last = new Date(d.getTime());
    // }
    // console.log(NEOS_GLOBAL)

}