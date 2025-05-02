import boto3
import json
import os
import urllib3
import logging

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.client('dynamodb')
dynamodb_doc = boto3.resource('dynamodb')
http = urllib3.PoolManager()

OPENAI_API_KEY = os.environ['OPENAI_API_KEY']
TABLE_NAME = os.environ['TABLE_NAME']

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    for record in event['Records']:
        logger.info("Processing record: %s", json.dumps(record))

        if record['eventName'] != 'INSERT':
            logger.info("Skipping non-INSERT event.")
            continue

        try:
            new_image = record['dynamodb']['NewImage']
            image_id = new_image['image_id']['S']
            labels = [label['S'] for label in new_image['DetectedLabels']['L']]
            timestamp = new_image['Timestamp']['S']

            logger.info("Image ID: %s", image_id)
            logger.info("Labels: %s", labels)
            logger.info("Timestamp: %s", timestamp)

            prompt = f"Write a short article about the image '{image_id}' which was detected with labels: {', '.join(labels)}."
            logger.info("Generated prompt: %s", prompt)

            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ]
            }

            encoded_data = json.dumps(data).encode('utf-8')
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            }

            try:
                logger.info("Sending request to OpenAI API...")
                
                response = http.request(
                    'POST',
                    'https://is215-openai.upou.io/v1/chat/completions',
                    body=encoded_data,
                    headers=headers,
                    timeout=10.0
                )

                logger.info("OpenAI response status: %s", response.status)
                logger.info("Raw OpenAI response: %s", response.data.decode('utf-8'))

                response_data = json.loads(response.data.decode('utf-8'))

                if 'choices' not in response_data or not response_data['choices']:
                    logger.error("Invalid response from OpenAI")
                    continue

                article = response_data['choices'][0]['message']['content']
                logger.info("Generated article: %s", article)

            except Exception as e:
                logger.error("Error during OpenAI API call: %s", str(e), exc_info=True)


            table = dynamodb_doc.Table(TABLE_NAME)
            logger.info("Saving article to DynamoDB...")

            table.update_item(
                Key={'image_id': image_id},
                UpdateExpression="SET article = :a",
                ExpressionAttributeValues={':a': article}
            )

            logger.info("Article successfully saved for image_id: %s", image_id)

        except Exception as e:
            logger.error("Error processing record for image_id %s: %s", image_id if 'image_id' in locals() else 'unknown', str(e), exc_info=True)

    return {
        'statusCode': 200,
        'body': 'Processed DynamoDB stream event.'
    }
