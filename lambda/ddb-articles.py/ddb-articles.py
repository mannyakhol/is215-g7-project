import json
import os
import boto3
import datetime

# Get table name from environment variable
TABLE_NAME = os.environ.get('DYNAMODB_TABLE')

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # Scan the table
        response = table.scan()
        data = response.get('Items', [])

        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            data.extend(response.get('Items', []))
            
        # Sort by Timestamp with most recent first
        try:
            # Sort the data by Timestamp in descending order (latest first)
            data = sorted(
                data, 
                key=lambda x: x.get('Timestamp', '1970-01-01T00:00:00.000000'), 
                reverse=True
            )
        except Exception as sort_error:
            print(f"Error sorting data: {str(sort_error)}")
            # If sorting fails, continue with unsorted data

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(data)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
