/*
Defines a single approach of a NEO. Instances are interned in the static BY_DATE
and BY_NEO dictionaries. See comments on them.

It has the following properties:

neo_id: The id of the NEO this describes a close approach of.

date: A JavaScript Date instance holding the date of the near approach. May not be a valid Date because NASA thinks November 31st is a thing.

relative_velocity_kph: The relative velocity of the NEO at the time of this approach, in kilometers per hour relative to Earth's velocity.
    Unit conversions should be defined as functions in util.js.

miss_distance_km: By how much the NEO missed earth, in kilometers.
    Unit conversions should be defined as functions in util.js.

orbiting_body: The body that the NEO was orbiting at the time of its close approach to Earth. Not always Earth!
*/
class Approach {

    // A dictionary keyed by ISO-8601 date strings and valued by arrays containing all
    // constructed Approach instances for the keyed date. This is keyed by string
    // instead of Date because Date equality comparison is by reference instead of by value.
    static BY_DATE = {}
    // A dictionary keyed by NEO id and valued by arrays containing all constructed Approach
    // instances for the keyed NEO.
    static BY_NEO = {}

    // Constructs a new Approach from a row of a CSV file.
    // Automatically stores the new instance in the
    // BY_NEO dictionary and the BY_DATE dictionary if
    // the date is not invalid.
    constructor(csvRow) {
        mapProperties(csvRow, this,
            "neo_id",
            "date",
            "relative_velocity_kph",
            "miss_distance_km",
            "orbiting_body"
        )

        // Convert string to Date and use the hours and minutes
        this.date = new Date(this.date)
        this.date.setHours(+csvRow.hour)
        this.date.setMinutes(+csvRow.minute)

        if (isValidDate(this.date)) {
            if (!Approach.BY_DATE[getISODateString(this.date)]) {
                Approach.BY_DATE[getISODateString(this.date)] = []
            }
            Approach.BY_DATE[getISODateString(this.date)].push(this)
        }

        // TODO: Should we show approaches with invalid dates at all?
        if (!Approach.BY_NEO[this.neo_id]) {
            Approach.BY_NEO[this.neo_id] = []
        }
        Approach.BY_NEO[this.neo_id].push(this)
    }

    toString() {
        return `${this.neo_id} on ${getISODateString(this.date)} at ${this.relative_velocity_kph} KPH`
    }
}