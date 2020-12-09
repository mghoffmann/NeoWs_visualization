import pandas as pd
import requests 
import json
import seaborn as sns
import matplotlib.pyplot as plt


BASE_URL = "https://api.nasa.gov/neo/rest/v1/feed"
# api_key = "iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2"
api_key = "DEMO_KEY"

next = f"{BASE_URL}?start_date=2000-01-01&end_date=2000-01-08&detailed=false&api_key=iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2"
while ("end_date=2000-02" not in next):

    resp = requests.get(next)
    data = json.loads(resp.text)
    data.pop("element_count")

    next = data.pop("links")["next"]
    print(next)
    data = data["near_earth_objects"]

    for day, neos in data.items():
        year = day[:day.index('-')]
        month = day[day.index('-')+1:day.rindex('-')]
        file = open(f'{year}-{month}')
        for i, neo in enumerate(neos):
            print(day, neo['id'])

























# "meters": { "estimated_diameter_min": 0.0,  "estimated_diameter_max": 0.0 },
# "close_approach_data": [ { 
#   "close_approach_date_full": "2015-Sep-01 17:50", 
#   "relative_velocity": { "kilometers_per_second": "19.4588172512", },
#   "miss_distance": { "kilometers": "47931282.447261663", }

# df = pd.DataFrame(columns = ["estimated_diameter_min", "estimated_diameter_max", "close_approach_date_full", "kilometers_per_second", "miss_distance_kilometers"])
# for key, val in data.items():
  # for i, item in val.iter():
    # print(item["links"]["self"])
    # print(item["id"], item["name"])
    # row = [ 
    #   item["estimated_diameter"]["meters"]["estimated_diameter_min"], 
    #   item["estimated_diameter"]["meters"]["estimated_diameter_max"], 
    #   item["close_approach_data"][0]["close_approach_date_full"], 
    #   item["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"], 
    #   item["close_approach_data"][0]["miss_distance"]["kilometers"] 
    # ]
    # df[i] = row

