// Describes a Near Earth Object and its close approaches to Earth.
//
// Fields:
//  id: A unique ID for this NEO. This works as a key for the NeoWS API too.
//  name: NASA's given name for this NEO
//  nasa_jpl_url: The URL to this NEO's NeoWS access point. Do not request this if avoidable: it counts toward the rate limit for the API key used in the Neo API request that retrieved this NEO's constructor data.
//  absolute_magnitude_h: The absolute magnitude (h) of this NEO. See https://cneos.jpl.nasa.gov/about/neo_groups.html for what that means.
//  is_potentially_hazardous_asteroid: Whether this NEO is potentially hazardous to Earth.
//  estimated_diameter_min: The minimum estimated diameter of this NEO
//  estimated_diameter_max: The maximum estimated diameter of this NEO
//  approaches: An array of Approach instances describing all of this NEO's approaches NASA knows about or predicts.
//
// Static members:
//  INTERN: A dictionary keyed by NEO id and valued by NEO instances. This is used to avoid making requests to the NeoWS API more than one time for the same NEO,
//        because the same NEO might be referenced multiple times by the Neo API.
//  getByID(id): Takes an ID and returns a NEO instance from INTERN or undefined if no instance has yet been constructd with that ID.
class NEO {

    // A dictionary containing each instance of this class, keyed by ID.
    static INTERN = {};
    // An array containing each instance of this class.
    static ALL = [];

    // approaches is sorted after assignment so these are linear time
    minDate() {
        return this.approaches[0].date;
    }
    maxDate() {
        return this.approaches[this.approaches.length - 1].date;
    }
    minYear() {
        return this.minDate().getUTCFullYear();
    }
    maxYear() {
        return this.maxDate().getUTCFullYear();
    }

    // Returns an array containing all the Approach instances
    // associated with this NEO.
    getApproaches() {
        return Approach.BY_NEO[this.id]
    }

    // Returns the NEO instance with the given id, or undefined if no
    // NEO has been constructed with that ID yet. See constructor.
    static getByID(id) {
        return NEO.INTERN[id];
    }

    constructor(csvRow) {
        mapProperties(csvRow, this,
            "id",
            "name",
            "absolute_magnitude_h",
            "estimated_diameter_min_km",
            "estimated_diameter_max_km",
            "is_potentially_hazardous",
            "orbit_id",
            "orbit_determination_date",
            "first_observation_date",
            "last_observation_date",
            "orbit_uncertainty",
            "minimum_orbit_intersection",
            "jupiter_tisserand_invariant",
            "epoch_osculation",
            "eccentricity",
            "semi_major_axis",
            "inclination",
            "ascending_node_longitude",
            "orbital_period",
            "perihelion_distance",
            "perihelion_argument",
            "aphelion_distance",
            "perihelion_time",
            "mean_anomaly",
            "mean_motion",
            "equinox",
            "orbit_class_type",
            "orbit_class_description",
            "orbit_class_range");

        this.estimated_diameter_median_km = (this.estimated_diameter_min_km + this.estimated_diameter_max_km) / 2.0;
        this.discovery_weekday = getDayOfWeek(new Date(this.first_observation_date));
        this.miss_distance_km = this.getApproaches()[0].miss_distance_km
        this.close_approach_date = this.getApproaches()[0].date

        NEO.INTERN[csvRow.id] = this;
        NEO.ALL.push(this)
    }

    toString() {
        return this.name;
    }
}