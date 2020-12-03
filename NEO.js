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

    approaches = [];

    // Returns the NEO instance with the given id, or undefined if no
    // NEO has been constructed with that ID yet. See constructor.
    static getByID(id) {
        return INTERN[id];
    }

    static WAITING = 0;

    // Each response from the Neo API has a near_earth_objects property,
    // which is a dictionary keyed by date and valued by arrays of objects.
    // This constructor expects a single one of those objects.
    // i.e. neoResponse.near_earth_objects["1900-01-01"][0]    
    constructor(json) {
        // If this response part describes a NEO that has already been constructed then
        // don't make another request to the NeoWs api for it.
        if (NEO.INTERN[json.id])
            return NEO.INTERN[json.id];

        this.neowsappLink = json.links.self;
        mapProperties(json, this,
            "id",
            "name",
            "nasa_jpl_url",
            "absolute_magnitude_h",
            "is_potentially_hazardous_asteroid");

        this.estimated_diameter_min = json.estimated_diameter.kilometers.estimated_diameter_min;
        this.estimated_diameter_max = json.estimated_diameter.kilometers.estimated_diameter_max;

        NEO.INTERN[json.id] = this;

        NEO.WAITING++;
        // This gets a response from the NeoWS API and set it to this.neowsJSON
        fetch(this.neowsappLink)
            .then(function (response) {
                return response.json();
            })
            .then(function (neowsJSON) {
                NEO.WAITING--;
                // Construct the approaches using the NeoWS data
                NEO.INTERN[json.id].approaches = [];

                neowsJSON.close_approach_data.forEach(a => {
                    NEO.INTERN[json.id].approaches.push(new Approach(json.id, a));
                });                
            })
            .catch(function (error) {
                NEO.WAITING--;
                // TODO: Show the user a message if we hit the rate limit. Or just avoid
                // hitting the rate limit...
                console.error(error);
            })
    }

    toString() {
        return this.name;
    }
}