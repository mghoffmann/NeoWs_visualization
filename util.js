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
function getISODateString(date, includeDay = true) {
    let r = date.toISOString();
    r = r.slice(0, r.indexOf("T"))

    if (!includeDay) {
        r = r.slice(0, r.lastIndexOf('-'))
    }

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
function baseName(path)
{
   var base = new String(path).substring(path.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}

let API_KEY = "iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2";

// Copied from Stackoverflow user Peter Bailey:
// https://stackoverflow.com/a/1267338/539997
function zeroFill(number, width = 2)
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Gets NEO data for the given dates, loading it from
// files as needed.
// startDate: A Date representing the start of the desired range. The time part of this Date is ignored.
// endDate: A Date representing the end of the desired range. The time part of this Date is ignored.
// onload: A callback that is passed an array of NEO instances when the data is loaded. See NEO.js.
//      This callback is not called if the data fetch results in an error.
// onerror: A callback that is passed an error if the data fetch fails.
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