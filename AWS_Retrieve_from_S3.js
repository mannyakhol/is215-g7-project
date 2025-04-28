const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'SECRET_ACCESS_KEY',
    region: 'REGION'
});

const s3 = new AWS.S3();

const params = {
    Bucket: 'bucket-name',
    Key: 'file-key.txt' // e.g., folder/file.txt
};

s3.getObject(params, (err, data) => {
    if (err) {
        console.error('Error retrieving file:', err);
    } else {
        console.log('File content:', data.Body.toString()); // Buffer to string
    }
});
