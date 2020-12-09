class DataBuilder {
    // The start date of this builder's range
    startDate = null;
    // The end date of this builder's range
    endDate = null;
    // The callback for when this builder is finished building.
    onLoad = null;
    // A callback for if one of this builder's fetches fails.
    onError = null;
    // An array of the months that are ready to be returned to the onLoad
    // callback. Once each integer in months exists as a key here, onLoad
    // is called with 
    months_loaded = []
    months = []
    days = []

    // A dictionary keyed by month numbers and valued by true.
    // If the NEOs for a month have not been loaded yet then the month's
    // number will not be a key here.
    // If the NEOs for a month have been loaded they will be in NEOS_BY_DATE
    // declared in utils.js
    static LOADED_MONTHS = {};

    constructor(startDate, endDate, onLoad, onError) {
        // Remove the time parts of the dates, if they exist.
        // We want to truncate them to just their day.
        cleanedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
        cleanedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0)

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
    }
}