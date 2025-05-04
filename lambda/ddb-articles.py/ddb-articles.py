import json
import os
import boto3
from botocore.exceptions import ClientError

# Get table name from environment variable
TABLE_NAME = os.environ.get('DYNAMODB_TABLE')

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # Check if there's a request for a specific article ID
        query_parameters = event.get('queryStringParameters', {}) or {}
        path_parameters = event.get('pathParameters', {}) or {}
        
        # Get article ID from different possible sources
        article_id = None
        
        # Check query parameters first (e.g., ?id=abc123)
        if query_parameters and 'id' in query_parameters:
            article_id = query_parameters.get('id')
        # Check path parameters (e.g., /articles/{id})
        elif path_parameters and 'id' in path_parameters:
            article_id = path_parameters.get('id')
        
        # If we have an article ID, query for the specific article
        if article_id:
            print(f"Querying for article with ID: {article_id}")
            try:
                # First try to get by 'id'
                response = table.get_item(Key={'id': article_id})
                item = response.get('Item')
                
                # If not found by 'id', try by 'image_id' as fallback
                if not item:
                    response = table.scan(
                        FilterExpression="image_id = :img_id",
                        ExpressionAttributeValues={':img_id': article_id}
                    )
                    items = response.get('Items', [])
                    if items:
                        item = items[0]
                
                # If still not found, return a 404
                if not item:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': f"Article with ID '{article_id}' not found"})
                    }
                
                # Return the single article
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps(item)
                }
                
            except ClientError as e:
                print(f"Error querying DynamoDB: {e}")
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': str(e)})
                }
        
        # Otherwise, scan the table for all articles
        response = table.scan()
        data = response.get('Items', [])

        # Handle pagination for full scan
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
            
            # Ensure each item has an id field
            for item in data:
                # If no id exists, use UUID if present or generate a string from image_id
                if 'id' not in item:
                    # Use image_id as fallback
                    item['id'] = str(item.get('image_id', 'unknown'))
        except Exception as sort_error:
            print(f"Error sorting or processing data: {str(sort_error)}")
            # If sorting fails, continue with unsorted data

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(data)
        }

    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
