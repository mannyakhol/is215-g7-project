import boto3
import os
import json
import logging
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def parse_sns_event(event):
    records = event.get('Records', [])
    messages = []
    for record in records:
        sns_message = record['Sns']['Message']
        try:
            # Try to parse the SNS message as JSON
            message_json = json.loads(sns_message)
            messages.append(message_json)
        except json.JSONDecodeError as e:
            logger.warning(f"Error parsing SNS message: {str(e)}")
            # If JSON parsing fails, the message might be malformed or duplicated
            # Try to extract individual JSON objects
            import re
            json_objects = re.findall(r'(\{.*?\})(?=\{|$)', sns_message)
            for json_str in json_objects:
                try:
                    obj = json.loads(json_str)
                    messages.append(obj)
                except json.JSONDecodeError:
                    logger.error(f"Could not parse JSON object: {json_str}")
    return messages

def transform_data(raw_message):
    # Handle the new message format with bucket, key, and labels
    image_id = raw_message.get('key', '').split('/')[-1]  # Extract filename from key
    
    # Generate a unique ID
    unique_id = str(uuid.uuid4())
    
    return {
        'id': unique_id,
        'image_id': image_id,
        'DetectedLabels': [label['Name'] for label in raw_message.get('labels', [])],
        'Timestamp': datetime.utcnow().isoformat()
    }

def validate_data(data):
    if not data.get('image_id'):
        raise ValueError("image_id missing")
    if not isinstance(data.get('DetectedLabels'), list):
        raise ValueError("DetectedLabels must be a list")
    return True

def save_to_dynamodb(item):
    try:
        response = table.put_item(
            Item=item,
            ConditionExpression='attribute_not_exists(image_id)'  # Ensure idempotency using 'image_id'
        )
        logger.info(f"DynamoDB insert success: {item['image_id']}")
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        logger.warning(f"Duplicate image_id: {item['image_id']} skipped")
    except Exception as e:
        logger.error(f"Error inserting into DynamoDB: {str(e)}")
        raise

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    try:
        messages = parse_sns_event(event)
        for raw_message in messages:
            transformed_data = transform_data(raw_message)
            validate_data(transformed_data)
            save_to_dynamodb(transformed_data)
        logger.info("All messages processed successfully")
    except Exception as e:
        logger.error(f"Lambda error: {str(e)}")
        raise
