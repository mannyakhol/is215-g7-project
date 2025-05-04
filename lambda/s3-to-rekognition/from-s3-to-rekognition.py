import json
import boto3
import os

rekognition = boto3.client('rekognition')
sns = boto3.client('sns')

def lambda_handler(event, context):
    # Get bucket and image key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    print(f"Processing image: s3://{bucket}/{key}")
    
    # Call Rekognition for label detection
    label_response = rekognition.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': key
            }
        },
        MaxLabels=10,
        MinConfidence=70
    )
    
    # Process labels
    labels = label_response['Labels']
    print("Detected labels:")
    label_data = []
    for label in labels:
        print(f"{label['Name']} : {label['Confidence']:.2f}%")
        label_data.append({
            'Name': label['Name'],
            'Confidence': label['Confidence']
        })
    
    # Call Rekognition for text detection
    text_response = rekognition.detect_text(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': key
            }
        }
    )
    
    # Process detected text
    text_detections = text_response['TextDetections']
    print("Detected text:")
    text_data = []
    for text in text_detections:
        # Only include WORD or LINE type detections
        if text['Type'] in ['WORD', 'LINE']:
            print(f"{text['DetectedText']} : {text['Confidence']:.2f}% ({text['Type']})")
            text_data.append({
                'DetectedText': text['DetectedText'],
                'Type': text['Type'],
                'Confidence': text['Confidence']
            })
    
    # Publish results to SNS topic
    sns_topic_arn = os.environ.get('SNS_TOPIC_ARN')
    if not sns_topic_arn:
        print("Warning: SNS_TOPIC_ARN environment variable not set")
        return {
            'statusCode': 500,
            'body': json.dumps('SNS_TOPIC_ARN environment variable not configured')
        }
    
    sns_message = {
        'bucket': bucket,
        'key': key,
        'labels': label_data,
        'text': text_data
    }
    
    sns.publish(
        TopicArn=sns_topic_arn,
        Message=json.dumps(sns_message),
        Subject=f"Image Analysis Results: {key}"
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Image processed successfully',
            'labels': label_data,
            'text': text_data
        })
    }