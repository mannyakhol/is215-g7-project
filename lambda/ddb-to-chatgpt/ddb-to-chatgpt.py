import boto3
import json
import os
import urllib3
import logging
import re

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.client('dynamodb')
dynamodb_doc = boto3.resource('dynamodb')
http = urllib3.PoolManager()

OPENAI_API_KEY = os.environ['OPENAI_API_KEY']
TABLE_NAME = os.environ['TABLE_NAME']

def parse_chatgpt_response(content):
    """Parse the ChatGPT response into title, summary, and article components."""
    title = ""
    summary = ""
    article = ""
    
    # Extract title (case insensitive)
    title_match = re.search(r'Title:(.*?)(?=Summary:|$)', content, re.IGNORECASE | re.DOTALL)
    if title_match:
        title = title_match.group(1).strip()
    
    # Extract summary (case insensitive)
    summary_match = re.search(r'Summary:(.*?)(?=Article:|$)', content, re.IGNORECASE | re.DOTALL)
    if summary_match:
        summary = summary_match.group(1).strip()
    
    # Extract article (case insensitive)
    article_match = re.search(r'Article:(.*?)$', content, re.IGNORECASE | re.DOTALL)
    if article_match:
        article = article_match.group(1).strip()
    
    # If parsing fails, use fallbacks
    if not title:
        title = "Article about " + ', '.join(labels[:3]) if 'labels' in globals() else "Generated Article"
    
    if not summary and len(content) > 150:
        # Use first 100 chars as fallback summary
        summary = content[:100].strip() + "..."
    elif not summary:
        summary = "Summary not available"
        
    if not article and title and summary:
        # If we have title and summary but no article, use the rest as article
        article = re.sub(r'^.*?(Summary:.*?\n)', '', content, flags=re.IGNORECASE | re.DOTALL)
    elif not article:
        article = content  # Use entire content if no structure was found
    
    return {
        'title': title,
        'summary': summary,
        'article': article
    }

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
            record_id = new_image.get('id', {}).get('S', '')
            labels = [label['S'] for label in new_image['DetectedLabels']['L']]
            timestamp = new_image['Timestamp']['S']

            logger.info("ID: %s", record_id)
            logger.info("Image ID: %s", image_id)
            logger.info("Labels: %s", labels)
            logger.info("Timestamp: %s", timestamp)

            prompt = f"Write an SEO article with with a hook, an introduction, and a conclusion about an image which was labeled as {', '.join(labels)}. Never mention anything about the image or the labels in the article just use it as an inspiration. Everything must be written in English and consider adding headings. Give me the title first as Title: then a 100 character summary as Summary: and then body of the article as Article: in HTML format. Don't include the title in the Article and just use div for the HTML"
            logger.info("Generated prompt: %s", prompt)

            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a creative writer."},
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
                    timeout=30.0  # Increased timeout for longer articles
                )

                logger.info("OpenAI response status: %s", response.status)

                response_data = json.loads(response.data.decode('utf-8'))

                if 'choices' not in response_data or not response_data['choices']:
                    logger.error("Invalid response from OpenAI")
                    continue

                full_content = response_data['choices'][0]['message']['content']
                logger.info("Generated content length: %d chars", len(full_content))
                
                # Parse the response to extract title, summary, and article
                parsed_content = parse_chatgpt_response(full_content)
                
                logger.info("Extracted title: %s", parsed_content['title'])
                logger.info("Summary length: %d chars", len(parsed_content['summary']))
                logger.info("Article length: %d chars", len(parsed_content['article']))

            except Exception as e:
                logger.error("Error during OpenAI API call: %s", str(e), exc_info=True)
                continue

            # Always use image_id as the primary key since that's what the table schema expects
            table = dynamodb_doc.Table(TABLE_NAME)
            logger.info("Saving article content to DynamoDB...")
            
            # Update expression to save title, summary and article separately
            update_expression = "SET title = :t, summary = :s, article = :a"
            expression_values = {
                ':t': parsed_content['title'], 
                ':s': parsed_content['summary'], 
                ':a': parsed_content['article']
            }

            # Always use image_id as the primary key
            table.update_item(
                Key={'id': record_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            logger.info("Content successfully saved for image_id: %s", image_id)

        except Exception as e:
            logger.error("Error processing record for image_id %s: %s", image_id if 'image_id' in locals() else 'unknown', str(e), exc_info=True)

    return {
        'statusCode': 200,
        'body': 'Processed DynamoDB stream event.'
    }
