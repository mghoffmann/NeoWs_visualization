/*
Defines a single approach of a NEO.

It has the following properties:

NEO_id: The id of the NEO this describes a close approach of.

date: A JavaScript Date instance holding the date of the near approach.

relative_velocity: The relative velocity of the NEO at the time of this approach, in kilometers per second relative to Earth's velocity.
    Unit conversions should be defined as functions in util.js.

miss_distance: By how much the NEO missed earth, in kilometers.
    Unit conversions should be defined as functions in util.js.

orbiting_body: The body that the NEO was orbiting at the time of its close approach to Earth. Not always Earth!
*/
class Approach {
    constructor(NEO_id, json) {
        this.NEO_id = NEO_id;
        this.date = new Date(json.close_approach_date);
        this.relative_velocity = json.relative_velocity.kilometers_per_second;
        this.miss_distance = json.miss_distance.kilometers;
        this.orbiting_body = json.orbiting_body;
    }
}