function mapProperties(source, target, ...propertyNames) {

    propertyNames.forEach(property => {
        target[property] = source[property]
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
function getISODateString(date) {
    let r = date.toISOString();
    r = r.slice(0, r.indexOf("T"))
    return r;
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

// https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY
// https://api.nasa.gov/neo/rest/v1/feed?start_date=2000-02-01&end_date=2000-02-10&api_key=iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2

let API_KEY = "iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2";

// NEO instances are interned here by date
let neoIntern = {};
// The start and end dates of the neo intern
let neoIntern_start = null;
let neoIntern_end = null;
const API_URL = "https://api.nasa.gov/neo/rest/v1/feed";

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

    // This gets a response from the NeoWS API and set it to this.neowsJSON
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            onload.call(null, constructNEOs(json));
        })
        .catch(function (error) {
            // TODO: Show the user the error messages somehow.
            console.error(error);
        })
}