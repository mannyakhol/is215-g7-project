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
    
    # Extract summary (case insensitive) - improved to avoid capturing HTML content
    summary_match = re.search(r'Summary:(.*?)(?=Article:|<div|$)', content, re.IGNORECASE | re.DOTALL)
    if summary_match:
        summary = summary_match.group(1).strip()
        # Additional cleanup to remove any HTML tags if they got included
        summary = re.sub(r'<[^>]+>', '', summary)
        # Limit length to ensure it's truly a summary
        if len(summary) > 200:  # If summary is suspiciously long
            summary = summary[:200].strip() + "..."
    
    # Extract article (case insensitive)
    article_match = re.search(r'Article:(.*?)$', content, re.IGNORECASE | re.DOTALL)
    if article_match:
        article = article_match.group(1).strip()
    
    # If parsing fails, use fallbacks
    if not title and 'labels' in locals():
        title = "Article about " + ', '.join(labels[:3])
    elif not title:
        title = "Generated Article"
    
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
            
            # Extract labels
            labels = []
            if 'DetectedLabels' in new_image and 'L' in new_image['DetectedLabels']:
                labels = [label['S'] for label in new_image['DetectedLabels']['L']]
            
            # Extract detected text
            detected_text = []
            if 'DetectedText' in new_image and 'L' in new_image['DetectedText']:
                detected_text = [text_item['S'] for text_item in new_image['DetectedText']['L']]
            
            # Extract combined text content if available
            text_content = ""
            if 'TextContent' in new_image and 'S' in new_image['TextContent']:
                text_content = new_image['TextContent']['S']
            
            timestamp = new_image['Timestamp']['S']

            logger.info("ID: %s", record_id)
            logger.info("Image ID: %s", image_id)
            logger.info("Labels: %s", labels)
            logger.info("Detected Text: %s", detected_text)
            logger.info("Text Content: %s", text_content)
            logger.info("Timestamp: %s", timestamp)

            # Create prompt including both labels and text
            prompt_parts = []
            
            if labels:
                prompt_parts.append(f"labeled as {', '.join(labels)}")
            
            if detected_text:
                formatted_text = ', '.join(detected_text)
                prompt_parts.append(f"containing the text: \"{formatted_text}\"")
            
            # Join all parts together with "and" if both exist
            prompt_context = " and ".join(prompt_parts)
            
            prompt = f"Write an SEO article with a hook, an introduction, and a conclusion about an image which was {prompt_context}. Never mention anything about the image, labels, or detected text in the article directly - just use them as inspiration. Everything must be written in English and consider adding headings. Give me the title first as Title: then a 100 character summary as Summary: and then body of the article as Article: in HTML format. Don't include the title or summary in the Article and just use div for the HTML."
            
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

            # Always use record_id as the primary key
            table = dynamodb_doc.Table(TABLE_NAME)
            logger.info("Saving article content to DynamoDB...")
            
            # Update expression to save title, summary and article separately
            update_expression = "SET title = :t, summary = :s, article = :a"
            expression_values = {
                ':t': parsed_content['title'], 
                ':s': parsed_content['summary'], 
                ':a': parsed_content['article']
            }

            # Use record_id as the primary key
            table.update_item(
                Key={'id': record_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            logger.info("Content successfully saved for image_id: %s", image_id)

        except Exception as e:
            logger.error("Error processing record for image_id %s: %s", 
                         image_id if 'image_id' in locals() else 'unknown', 
                         str(e), exc_info=True)

    return {
        'statusCode': 200,
        'body': 'Processed DynamoDB stream event.'
    }