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

    WAITING = 0;

    constructor(startDate, endDate, onLoad, onError) {
        this.onLoad = onLoad;
        this.onError = onError;

        // Remove the time parts of the dates, if they exist.
        // We want to truncate them to just their day.
        let cleanedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
        let cleanedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0)

            // The file names that this builder needs to load async to populate days.
        let monthFiles = []

        // Get all the days in the range
        let dayCount = Math.ceil((cleanedEnd - cleanedStart) / MILLISECONDS_PER_DAY)
        console.log(`Fetching data for ${dayCount} day${dayCount == 1 ? "" : "s"}`)

        for (var i = 0; i < dayCount; i++) {
            let dayDate = new Date(cleanedStart.getTime() + MILLISECONDS_PER_DAY * i)

            // If this day's month file has been loaded then it will be in NEOS_BY_DATE
            let data = NEOS_BY_DATE[getISODateString(dayDate)]
            this.days[getISODateString(dayDate)] = data; // This is sometimes undefined intentionally

            // Otherwise add its month to months, but only if it's the first day of its month in this range.
            if (!data && (i == 0 || dayDate.getDate() == 1)) {
                // Months are zero based but years and dates are one based because JavaScript is weird
                monthFiles.push(dayDate)
                // console.log(`Queueing ${`${dayDate.getFullYear()}-${zeroFill(dayDate.getMonth() + 1)}.json`} because ${[!data ? "data is undefined" : null, i == 0 ? "i == 0" : null, dayDate.getDate() == 1 ? "first of month" : null].filter(i=>i!= null).join(", ")}`)
            }
        }

        if (dayCount == 0) {
            // The only month is the month of the start and end, which are the same day.
            // In this case dayCount is 0 so add cleanedStart to the requests/data as needed.
            let data = NEOS_BY_DATE[cleanedStart]
            this.days[getISODateString(cleanedStart)] = data
            if (!data)
                monthFiles.push(cleanedStart)
        }

        if (!monthFiles.length) {
            console.log("All needed dates were already loaded.")
            onLoad(this.days);
        } else {
            console.log(`Loading files for ${monthFiles.length} month(s)`)
            this.WAITING = monthFiles.length
            // Every date in months needs its month file loaded
            for (var day of monthFiles) {
                let monthFile = `/data/ids/${day.getFullYear()}-${zeroFill(day.getMonth() + 1)}.json`
                QueueFetch(new Fetch(monthFile, data => {
                    for (var dateString of Object.keys(data)) {
                        let date = new Date(dateString)
                        let neos_for_date = data[dateString]
        
                        let constructions = []
                        for (var json of neos_for_date) {
                            constructions.push(new NEO(json))
                        }
                        NEOS_BY_DATE[getISODateString(date)] = constructions
                        this.days[getISODateString(date)] = constructions
                    }
                    this.WAITING--
                    if (this.WAITING == 0) {
                        this.onLoad(this.days)
                    }
                }))
            }
        }
    }
}