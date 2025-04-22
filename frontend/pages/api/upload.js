import aws from 'aws-sdk';
import nextConnect from 'next-connect';

aws.config.update({ region: 'us-east-1' });

const s3 = new aws.S3();
const handler = nextConnect();

handler.use(async (req, res, next) => {
  try {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    req.body = JSON.parse(data);
    next();
  } catch (err) {
    console.error('Error parsing body:', err);
    res.status(400).json({ error: 'Invalid body' });
  }
});

handler.post(async (req, res) => {
  console.log('✅ API HIT!');
  console.log('Request Body:', req.body);

  try {
    const { filename, filetype } = req.body;

    if (!filename || !filetype) {
      return res.status(400).json({ error: 'Missing filename or filetype' });
    }

    const params = {
      Bucket: 'is215-upload-test1',
      Key: filename,
      Expires: 60,
      ContentType: filetype,
    };

    const url = await s3.getSignedUrlPromise('putObject', params);
    console.log('Generated URL:', url);

    res.status(200).json({ url });
  } catch (err) {
    console.error('❌ Error in handler:', err);
    res.status(500).json({ error: 'Failed to get signed URL' });
  }
});

export default handler;
