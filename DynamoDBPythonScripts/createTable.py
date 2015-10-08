# You must have an AWS configuration to use boto
# See: https://boto3.readthedocs.org/en/latest/guide/quickstart.html#installation
# Also, you must run DynamoDB on port 8000
# Download link: http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.JsShell.html

import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")

# username (string) is primary key
table = dynamodb.create_table(
    TableName='RunnerData',
    KeySchema=[
        {
            'AttributeName': 'username',
            'KeyType': 'HASH'
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'username',
            'AttributeType': 'S'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 10,
        'WriteCapacityUnits': 10
    }
)
# ProvisionedThroughput will be used by AWS to determine how much throughput we get
# This doesn't matter for the local DynamoDB instance, but if you use the AWS cloud:
# KEEP THE THROUGHPUT AS LOW AS POSSIBLE SO WE DON'T EXCEED THE FREE TIER!
