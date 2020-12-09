class Week {
    // The number of 7-day periods between January 1st 1900
    // and this period's start date
    number = null;
    // This week's start date, inclusive.
    // Might not be a Monday because this isn't a calendar week,
    // just a 7 day period.
    start = new Date()
    // This week's end date, inclusive.
    end = null;

    // This is the earliest date in the NeoWS database.
    static EPOCH = new Date(1900, 0, 1).getTime();
    static MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

    // Gets the week number of the given date.
    static getWeek(date) {
        return Math.floor((date - Week.EPOCH) / Week.MILLISECONDS_PER_WEEK);
    }

    // Returns true or false indicating whether this week contains the given date.
    contains(date) {
        return this.start <= date && this.end >= date;
    }

    constructor(weekNumber) {
        this.start = new Date(Week.EPOCH + weekNumber * Week.MILLISECONDS_PER_WEEK)
        this.end = new Date(this.start.getTime() + Week.MILLISECONDS_PER_WEEK)
        this.number = weekNumber
    }

    toString() {
        return `${getISODateString(this.start)} to ${getISODateString(this.end)}`
    }
}