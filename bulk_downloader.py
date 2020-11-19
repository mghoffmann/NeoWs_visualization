import requests
import datetime

NASA_URL = "https://api.nasa.gov/neo/rest/v1/feed"
API_KEY = "iIulBulltgU6a56xZRHN4H3l9WmuAYTsLGpBGhQ2"

dayCount = 10#(2019-1900) * 365 + (2020 - 1900) / 4 - 1
startDate = datetime.date(1900, 1, 1)

f = open('sample_data.js', 'w')

f.write('// This is sample data from the neo api\nlet DATA = [')

f.close()

f = open('sample_data.js', 'ab')

fromDate = startDate;
for toDate in (startDate + datetime.timedelta(n) for n in range(1, dayCount)):    
    print(toDate)
    response = requests.get(NASA_URL,
                            params={
                                'start_date': fromDate, 'end_date': toDate, 'api_key': API_KEY
                            })
    f.write(response.content)
    f.write(b',')
    fromDate = toDate

f.write(b']')
f.close()