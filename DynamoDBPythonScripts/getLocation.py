import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:8000')
username = 'Pauli Morphisme'

# Very straighforward: obtain the data for specified user
table = dynamodb.Table('RunnerData')
response = table.query(
    KeyConditionExpression=Key('username').eq(username)
)

for i in response['Items']:
    print(i['username'], i['latitude'], i['longitude'], i['timestamp'])
