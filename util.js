// Copied from Stackoverflow user Dan:
// https://stackoverflow.com/a/175787/539997
// Returns whether a string could be parsed as a float.
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function isBoolean(str) {
    return ("" + str).toLowerCase() == "false" || ("" + str).toLowerCase() == "true";
}

function mapProperties(source, target, ...propertyNames) {

    propertyNames.forEach(property => {
        let value = source[property]
        if (isNumeric(value))
            // Coerce numeric strings to numbers
            target[property] = +value;
        else if (isBoolean(value))
            target[property] = eval(("" + value).toLowerCase());
        else
            target[property] = value
    });

    return target;
}

function kps_to_kph(kps) {
    return kps * 60 * 60;
}

function kph_to_kps(kph) {
    return kph / (60 * 60);
}

// Copied from Stackoverflow user Shog9, at
// https://stackoverflow.com/a/111545/539997
// Takes a dictionary of URL query parameters and formats them for inclusion in a URL.
// Does not include the leading question mark.
function encodeQueryData(data, encode = false) {
    const ret = [];
    for (let d in data)
        ret.push(
            (encode ? encodeURIComponent(d) : d) +
            '=' +
            (encode ? encodeURIComponent(data[d]) : data[d])
        );
    return ret.join('&');
}

// Returns just the date part of the ISO-8601 string representation of a Date instance.
// The NASA API wants date query parameters in this format.
function getISODateString(date, includeDay = true) {
    let r = date.toISOString();
    r = r.slice(0, r.indexOf("T"))

    if (!includeDay) {
        r = r.slice(0, r.lastIndexOf('-'))
    }

    return r;
}

const getPrettyDateString = d3.timeFormat('%a %b %e %Y')

// Copied from Stackoverflow user Borgar:
// https://stackoverflow.com/a/1353711/539997
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

// Constructs an array of NEO instances from the JSON of a response from the NASA API
function constructNEOs(response) {
    let NEOs = [];
    for (day in response.near_earth_objects) {
        for (neoIndex in response.near_earth_objects[day]) {
            let neoJSON = response.near_earth_objects[day][neoIndex]
            NEOs.push(new NEO(neoJSON));
        }
    }

    return NEOs;
}

// Copied from https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
function range(start, end) {
    return Array.from({
            length: end - start + 1
        },
        (_, i) => i)
}

// Returns a copy of the given array with duplicate values removed.
// Duplicity is determined with the given comparator, or the === operator
// if none is given. The comparator should return true if the two given values
// are equal, false otherwise.
function unique(array, comparator = null) {
    return array.filter((value, index, self) => {
        if (comparator)
            return comparator(self[self.indexOf(value)], self[index])
        else
            return self.indexOf(value) === index
    });
}


// A dictionary keyed by date times (Date.getTime() results) and valued by
// arrays of NEO class instances.
// This is populated as needed in the requestNEOs function,
// using data from the .month files in the data folder.
let NEOS_BY_DATE = {};
let NEO_DATA = {};

// This is the earliest date in the NeoWS database.
const NASA_EPOCH = new Date(1900, 0, 1);

// Returns the number of months since the given date's month and the API's epoch month.
// Usable as an key to LOADED_MONTHS.
function getMonthNumber(date) {
    return (date.getFullYear() - NASA_EPOCH.getFullYear()) * 12 + (date.getMonth() - NASA_EPOCH.getMonth())
}

// Returns just the file part of a URL string or UNIX file path.
// Copied from stackoverflow user Nivas:
// https://stackoverflow.com/a/3820412/539997
function baseName(path) {
    var base = new String(path).substring(path.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}

// Copied from Stackoverflow user Peter Bailey:
// https://stackoverflow.com/a/1267338/539997
function zeroFill(number, width = 2) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function getMinMax() {
    let maxSeparation = 60;
    let minSeparation = 20;
    let max = d3.randomUniform( (margin*2) + minSeparation, lineWidth )();  // random between 60 and lineWidth
    let min = d3.randomUniform( (margin*2), max - minSeparation)();  // random between 40 and the max - 20

    if (max - min > maxSeparation) {
        min = max - maxSeparation
    }

    return [ min, max ];
}
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Gets NEO data for the given dates, loading it from
// files as needed.
// startDate: A Date representing the start of the desired range. The time part of this Date is ignored.
// endDate: A Date representing the end of the desired range. The time part of this Date is ignored.
// onload: A callback that is passed a dictionary when the data is loaded. It is keyed by date and valued by arrays of NEO instances for that date. See NEO.js.
// onerror: A callback that is passed an error if a data fetch fails.
function getNEOs(startDate, endDate, onLoad, onError) {
    // Recurse if needed to make sure start is before or equal to end
    if (startDate > endDate) {
        return getNEOs(endDate, startDate, onLoad, onError);
    }

    let builder = new DataBuilder(startDate, endDate, onLoad, onError);
}

let API_KEY = "iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2";
const API_URL = "https://api.nasa.gov/neo/rest/v1/feed";
var numberOfRequests = 0;

// Requests NEO data from the NASA API.
// startDate: A Date representing the start of the desired range. The time part of this Date is ignored by the API.
// endDate: A Date representing the end of the desired range. The time part of this Date is ignored by the API.
// onload: A callback that is passed an array of NEO instances when the response is received. See NEO.js.
//      This callback is not called if the request results in an error.
function requestNEOs(startDate, endDate, onload) {
    let queryData = {
        "start_date": getISODateString(startDate),
        "end_date": getISODateString(endDate),
        "api_key": API_KEY
    }
    let requestURL = API_URL + '?' + encodeQueryData(queryData);


    // This gets a response from the NeoWS API and calls onload with NEO
    // instances constructed from the results.
    fetch(requestURL)
        .then(function (response) {
            // console.log(numberOfRequests++);
            return response.json();
        })
        .then(function (json) {
            console.log(json)
            onload.call(null, constructNEOs(json));
        })
        .catch(function (error) {
            // TODO: Show the user the error messages somehow.
            console.error(error);
        })
}

const ApproachAverages = [
    12.5, 8, 8, 8, 8.5, 10.5, 10, 11, 7.5, 11.5, 8, 13, 8, 8.5, 12, 11, 10, 8, 9.5, 8.5, 13, 9.5, 6.5, 12.5, 11.5, 11.5, 11.5, 10.5, 10, 14.5, 7.5, 9.5, 12.5, 11.5, 9.5, 11, 9.5, 5.5, 10.5, 13, 9, 12, 7.5, 7, 12.5, 10.5, 6, 11.5, 11.5, 11.5, 6.5, 9.5, 13.5, 11, 6.5, 9.5, 9, 9.5, 11, 18, 6, 6.5, 10, 9.5, 9, 6, 6, 5.5, 8.5, 5.5, 7.5, 11.5, 5, 7, 8, 5, 8, 6, 8, 13.5, 6, 10, 8.5, 7, 12, 6, 9.5, 6.5, 9, 10, 5.5, 7.5, 5.5, 6.5, 8.5, 9.5, 10, 9, 7, 9.5, 12.5, 12, 8, 9.5, 11, 5.5, 9.5, 5.5, 13, 9, 12, 14.5, 8, 11.5, 8.5, 9, 11, 8, 10, 7.5, 10.5, 9, 11, 14, 9, 6.5, 6.5, 6, 5, 5.5, 6, 5.5, 10, 11, 5, 11.5, 6, 6.5, 5.5, 9.5, 5, 8, 8.5, 8, 7.5, 5.5, 8.5, 6.5, 11.5, 4.5, 8.5, 10, 8.5, 10.5, 5.5, 6.5, 9, 4.5, 6, 7.5, 8.5, 4, 5, 8, 6.5, 5.5, 10.5, 5.5, 5.5, 8.5, 5, 8.5, 6, 5.5, 8, 8.5, 4.5, 9, 7, 5, 8, 6.5, 6, 6, 6.5, 8, 8, 5, 6.5, 5.5, 8.5, 6, 6.5, 7, 9, 5.5, 9.5, 5, 6.5, 8.5, 9.5, 8, 8, 8.5, 8.5, 8, 11, 6.5, 9.5, 7.5, 9, 8, 10, 8, 8, 9, 12.5, 6.5, 8, 6.5, 9.5, 6.5, 10, 4, 13, 7, 6.5, 5, 8, 10, 9, 11, 13, 11, 9.5, 7, 10, 9.5, 8.5, 8, 6, 7.5, 7.5, 8, 9.5, 7, 8, 13, 7.5, 11.5, 10, 13, 12.5, 12.5, 11, 12, 13, 13.5, 11.5, 10.5, 15.5, 10.5, 17.5, 11.5, 12.5, 10, 13, 12, 9, 11.5, 10.5, 10, 10.5, 9.5, 9.5, 10.5, 5.5, 11.5, 9, 13.5, 8, 11.5, 10.5, 10, 8.5, 11, 11, 14.5, 9, 10, 17, 11, 17, 12.5, 8, 11, 8.5, 15, 11, 10.5, 8.5, 12.5, 10.5, 9, 9.5, 10, 9.5, 8, 11.5, 9, 8.5, 13, 9, 9.5, 12, 7.5, 5.5, 11, 11.5, 11, 10, 11, 10.5, 7.5, 11.5, 6, 8, 8.5, 10, 12, 4, 7.5, 5.5, 9.5, 9.5, 7.5, 13, 8.5, 6.5, 4, 9, 7, 9, 3, 2.5, 8, 4.5, 4, 5.5, 7, 7.5, 4.5, 7, 6.5, 6, 4.5, 5, 3.5, 7, 6.5, 6.5, 4.5, 7.5, 5.5, 4.5, 2
]

function createAverages() {

    // Get a sorted array of all the Dates
    //  And then remove the top one
    sortedKeys = Object.keys(Approach.BY_DATE).sort((a, b) => new Date(a) - new Date(b))
    sortedKeys.shift()
    // Count the Approaches on each day
    countsPerDay = sortedKeys.map(sk => [sk, Approach.BY_DATE[sk].length])

    let ave_obj = {}
    countsPerDay.forEach(row => {
        let day = row[0].slice(5)

        if (ave_obj[day] === undefined) {
            ave_obj[day] = {
                amount: 1,
                sum: row[1]
            }
        } else {
            ave_obj[day].amount++;
            ave_obj[day].sum += row[1];
        }
    })

    Object.entries(ave_obj)
        .forEach(entry =>
            ApproachAverages.push((entry[1].sum / entry[1].amount))
        );
    // console.log(ApproachAverages)


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

    //     console.log("last: ", last)

    //     last = new Date(d.getTime());
    // }

}