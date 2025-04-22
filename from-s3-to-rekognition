import json
import boto3

rekognition = boto3.client('rekognition')

def lambda_handler(event, context):
    # Get bucket and image key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    print(f"Processing image: s3://{bucket}/{key}")
    
    # Call Rekognition
    response = rekognition.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': key
            }
        },
        MaxLabels=10,
        MinConfidence=70
    )

    labels = response['Labels']
    
    print("Detected labels:")
    for label in labels:
        print(f"{label['Name']} : {label['Confidence']:.2f}%")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Image processed successfully')
    }
