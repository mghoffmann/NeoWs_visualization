import datetime
import os
from os.path import splitext
import json

root = './data/neos'
files = os.listdir('./data/neos/')
if ('neos.csv' in files):
    files.remove("neos.csv")

if ('approaches.csv' in files):
    files.remove("approaches.csv")

print('{0} file(s)'.format(len(files)))

neo_headers = ['id',
               'name',
               'absolute_magnitude_h',
               'estimated_diameter_min_km',
               'estimated_diameter_max_km',
               'is_potentially_hazardous',
               'orbit_id',
               'orbit_determination_date',
               'first_observation_date',
               'last_observation_date',
               'orbit_uncertainty',
               'minimum_orbit_intersection',
               'jupiter_tisserand_invariant',
               'epoch_osculation',
               'eccentricity',
               'semi_major_axis',
               'inclination',
               'ascending_node_longitude',
               'orbital_period',
               'perihelion_distance',
               'perihelion_argument',
               'aphelion_distance',
               'perihelion_time',
               'mean_anomaly',
               'mean_motion',
               'equinox',
               'orbit_class_type',
               'orbit_class_description',
               'orbit_class_range'
               ]

approach_headers = ["neo_id",
                    "date",
                    "hour",
                    "minute",
                    "relative_velocity_kph",
                    "miss_distance_km",
                    "orbiting_body"]

neosFile = open(root + "/neos.csv", 'w')
approachesFile = open(root + '/approaches.csv', 'w')


def writeNEOS(value, endOfLine=False):
    if (type(value) == type("str") and value[0] != "\""):
        writeNEOS('"' + value + '"')
    elif (endOfLine):
        neosFile.write(str(value))
    else:
        neosFile.write(str(value) + ",")


def writeAppr(value, endOfLine=False):
    if (type(value) == type("str") and value[0] != "\""):
        writeAppr('"' + value + '"')
    elif (endOfLine):
        approachesFile.write(str(value))
    else:
        approachesFile.write(str(value) + ",")


for h in neo_headers:
    writeNEOS(h, h == neo_headers[-1:][0])

for h in approach_headers:
    writeAppr(h, h == approach_headers[-1:][0])

# Takes a string and an array of 2-ples, each containing a string to find and a string to replace it with.
def subAll(s, subs):
    r = str(s)
    for sub in subs:
        r = r.replace(sub[0], sub[1])
    return r

MMM_REPLACEMENTS = [
    ['Jan', '01'],
    ['Feb', '02'],
    ['Mar', '03'],
    ['Apr', '04'],
    ['May', '05'],
    ['Jun', '06'],
    ['Jul', '07'],
    ['Aug', '08'],
    ['Sep', '09'],
    ['Oct', '11'],
    ['Nov', '11'],
    ['Dec', '12'],
]

for fname in files:
    neosFile.write('\n')
    with open(root + '/' + fname) as f:
        id = splitext(fname)[0]
        data = json.load(f)

        writeNEOS(id)
        writeNEOS(data['designation'])
        if ('absolute_magnitude_h' in data):
            writeNEOS(data['absolute_magnitude_h'])
        else:
            writeNEOS('0')
        if ('estimated_diameter' in data):
            writeNEOS(data['estimated_diameter']['kilometers']
                      ['estimated_diameter_min'])
            writeNEOS(data['estimated_diameter']['kilometers']
                      ['estimated_diameter_max'])
        else:
            writeNEOS('0')
            writeNEOS('0')

        writeNEOS(data['is_potentially_hazardous_asteroid'])
        writeNEOS(data['orbital_data']['orbit_id'])
        writeNEOS(data['orbital_data']['orbit_determination_date'])
        writeNEOS(data['orbital_data']['first_observation_date'])
        writeNEOS(data['orbital_data']['last_observation_date'])
        writeNEOS(data['orbital_data']['orbit_uncertainty'])
        writeNEOS(data['orbital_data']['minimum_orbit_intersection'])
        writeNEOS(data['orbital_data']['jupiter_tisserand_invariant'])
        writeNEOS(data['orbital_data']['epoch_osculation'])
        writeNEOS(data['orbital_data']['eccentricity'])
        writeNEOS(data['orbital_data']['semi_major_axis'])
        writeNEOS(data['orbital_data']['inclination'])
        writeNEOS(data['orbital_data']['ascending_node_longitude'])
        writeNEOS(data['orbital_data']['orbital_period'])
        writeNEOS(data['orbital_data']['perihelion_distance'])
        writeNEOS(data['orbital_data']['perihelion_argument'])
        writeNEOS(data['orbital_data']['aphelion_distance'])
        writeNEOS(data['orbital_data']['perihelion_time'])
        writeNEOS(data['orbital_data']['mean_anomaly'])
        writeNEOS(data['orbital_data']['mean_motion'])
        writeNEOS(data['orbital_data']['equinox'])
        writeNEOS(data['orbital_data']['orbit_class']['orbit_class_type'])
        writeNEOS(data['orbital_data']['orbit_class']
                  ['orbit_class_description'])
        writeNEOS(data['orbital_data']['orbit_class']
                  ['orbit_class_range'], True)

        approaches = data['close_approach_data']
        for approach in approaches:
            approachesFile.write('\n')
            writeAppr(id)
            date = str(approach['close_approach_date_full'])
            day = date.split(' ')[0]
            day = subAll(day, MMM_REPLACEMENTS)
            time = date.split(' ')[1]
            hour = time.split(':')[0]
            minute = time.split(':')[1]
            writeAppr(day)
            writeAppr(hour)
            writeAppr(minute)
            writeAppr(approach['relative_velocity']['kilometers_per_hour'])
            writeAppr(approach['miss_distance']['kilometers'])
            writeAppr(approach['orbiting_body'], True)


neosFile.close()
