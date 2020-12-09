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


// A dictionary keyed by dates in ISO-8601 format and valued with
// arrays of NEO class instances.
// This is populated as needed in the requestNEOs function,
// using data from the .month files in the data folder.
let NEOS_BY_DATE = {};
let NEO_DATA = {};

// A dictionary keyed by month numbers and valued by true.
// If the NEOs for a month have not been loaded yet then the month's
// number will not be a key here.
let LOADED_MONTHS = {};

// This is the earliest date in the NeoWS database.
const NASA_EPOCH = new Date(1900, 0, 1);

// Returns the number of months since the given date's month and the API's epoch month.
// Usable as an key to LOADED_MONTHS.
function getMonthNumber(date) {
    return (date.getFullYear() - NASA_EPOCH.getFullYear()) * 12 + (date.getMonth() - NASA_EPOCH.getMonth())
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Gets NEO data for the given dates, loading it from
// files as needed.
// startDate: A Date representing the start of the desired range. The time part of this Date is ignored.
// endDate: A Date representing the end of the desired range. The time part of this Date is ignored.
// onload: A callback that is passed an array of NEO instances when the data is loaded. See NEO.js.
//      This callback is not called if the data fetch results in an error.
// onerror: A callback that is passed an error if the data fetch fails.
function getNEOs(startDate, endDate, onload) {

    // Recurse if needed to make sure start is before or equal to end
    if (startDate > endDate) {
        return getNEOs(endDate, startDate, onload);
    }

    // Remove the time parts of the dates, if they exist.
    // We want to truncate them to just their day.
    cleanedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
    cleanedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0)

    let months = []
    let dates = []

    // Get all the days in the range
    let dayCount = Math.ceil((cleanedEnd - cleanedStart) / MILLISECONDS_PER_DAY)
    for (var i = 0; i < dayCount; i++) {
        let day = new Date(cleanedStart.getTime() + MILLISECONDS_PER_DAY * i)
        dates.push(day)
        if (i == 0 || day.getDate() == 1) {
            months.push(getMonthNumber(day))
        }
    }

    if (dates.length == 0) {
        // The only month is the month of the start and end, which are the same day.
        dates.push(cleanedStart);
        months.push(getMonthNumber(cleanedStart))
        console.log('samesies')
    }

    for (month of months) {
        
    }
}

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