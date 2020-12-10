class DataBuilder {
    // The start date of this builder's range
    startDate = null;
    // The end date of this builder's range
    endDate = null;
    // The callback for when this builder is finished building.
    onLoad = null;
    // A callback for if one of this builder's fetches fails.
    onError = null;

    // A dictionary keyed by a Date for each day in this builder's range,
    // valued by an array of NEO instances for that date.
    days = {}
    // An array of the month file names that have been loaded.
    // Once each string in months exists in here, onLoad
    // is called with days as a parameter.
    months_loaded = []
    // The file names that this builder needs to load async to populate days.
    months = []
    // A dictionary that is keyed by the months in months and valued by
    // the days in the keys of days which belong in those months.
    // Used to make assignment to days faster when async requests complete.
    days_by_month = {}

    // A dictionary keyed by month numbers and valued by true.
    // If the NEOs for a month have not been loaded yet then the month's
    // number will not be a key here.
    // If the NEOs for a month have been loaded they will be in NEOS_BY_DATE
    // declared in utils.js, which is keyed by each Date's total milliseconds.
    static LOADED_MONTHS = {};

    constructor(startDate, endDate, onLoad, onError) {
        // Remove the time parts of the dates, if they exist.
        // We want to truncate them to just their day.
        let cleanedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
        let cleanedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0)

        // Get all the days in the range
        let dayCount = Math.ceil((cleanedEnd - cleanedStart) / MILLISECONDS_PER_DAY)
        for (var i = 0; i < dayCount; i++) {
            let day = new Date(cleanedStart.getTime() + MILLISECONDS_PER_DAY * i)

            // If this day's month file has been loaded then it will be in NEOS_BY_DATE
            let data = NEOS_BY_DATE[day.getTime()]
            this.days[day] = data; // This is sometimes undefined intentionally
            if (this.days_by_month[getMonthNumber(day)])
                this.days_by_month[getMonthNumber(day)].push(day)
            else
                this.days_by_month[getMonthNumber(day)] = [day]

            // Otherwise add its month to months, but only if it's the first day of its month in this range.
            if (!data && (i == 0 || day.getDate() == 1)) {
                // Months are zero based but years and dates are one based because JavaScript is weird
                this.months.push(day)
            }
        }

        if (dayCount == 0) {
            // The only month is the month of the start and end, which are the same day.
            // In this case dayCount is 0 so add cleanedStart to the requests/data as needed.
            let data = NEOS_BY_DATE[cleanedStart]
            this.days[cleanedStart] = data
            if (!data)
                this.months.push(cleanedStart)
        }

        // Every date in months needs its month file loaded
        for (var day of this.months) {
            let monthFile = `${day.getFullYear()}-${zeroFill(day.getMonth() + 1)}.json`
            fetch(`data/ids/${monthFile}`, {
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    for (var dateString of Object.keys(data)) {
                        let date = new Date(dateString)
                        let neos_for_date = data[dateString]
                        
                    }                    
                })
        }
    }
}