function mapProperties(source, target, ...propertyNames) {

    propertyNames.forEach(property => {
        target[property] = source[property]
    });

    return target;
}

class NEO {

    // A dictionary containing each instance of this class, keyed by ID.
    static INTERN = {
        0: null
    };

    // Each response from the neo API has a near_earth_objects property,
    // which is a dictionary keyed by date and valued by arrays of objects.
    // This constructor expects a single one of those objects.
    // i.e. neoResponse.near_earth_objects["1900-01-01"][0]    
    constructor(json) {
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

        // This gets a response from the NeoWS API and set it to this.neowsJSON
        fetch(this.neowsappLink)
            .then(function (response) {
                return response.json();
            })
            .then(function (neowsJSON) {
                NEO.INTERN[json.id].neowsJSON = neowsJSON;
                console.log(NEO.INTERN[json.id]);
            })
            .catch(function (error) {
                console.error(error);
            })
    }
}