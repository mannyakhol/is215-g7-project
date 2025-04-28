# is215-g7-project
import boto3
import os
import json
import logging
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
        message_json = json.loads(sns_message)
        messages.append(message_json)
    return messages

def transform_data(raw_message):
    return {
        'image_id': raw_message.get('ImageID'),  # Corrected typo here to 'image_id'
        'DetectedLabels': [label['Name'] for label in raw_message.get('Labels', [])],
        'Timestamp': raw_message.get('Timestamp', datetime.utcnow().isoformat())
    }

def validate_data(data):
    if not data.get('image_id'):
        raise ValueError("ImageID missing")
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
