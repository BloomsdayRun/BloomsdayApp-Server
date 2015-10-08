import boto3
import calendar, time
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")

table = dynamodb.Table('RunnerData')

# number types have 38 digits precision (sufficient for GPS coordinates)
# in this example, they are cast to strings for convenience 
latitude = 33.758411244670235
longitude = -84.38608467600716
# timestamp is UNIX timestamp in seconds
timestamp = int(calendar.timegm(time.gmtime()))

response = table.put_item(
    Item={
        'username': 'Pauli Morphisme',
        'latitude': str(latitude),
        'longitude' : str(longitude),
        'timestamp' : timestamp
    }
)
