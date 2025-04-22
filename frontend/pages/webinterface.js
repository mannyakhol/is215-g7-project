import { useState } from 'react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }


    // handles upload to S3 via PUT method from AWS

    const uploadUrl = `https://is215-upload-test1.s3.amazonaws.com/${encodeURIComponent(file.name)}`;

    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (response.ok) {
        setMessage('Upload successful!');
      } else {
        setMessage('Upload failed');
      }
    } catch (error) {
      setMessage('Upload failed');
      console.error('Error uploading file:', error);
    }
  };

  // Upload image interface

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload to S3</h1>
        
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 mb-4"
        />

        {file && <p className="text-sm text-gray-600 mb-2">Selected: <strong>{file.name}</strong></p>}

        <button
          onClick={handleUpload}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          Upload File
        </button>

        {message && <p className="mt-4 text-gray-700">{message}</p>}

        {/* // GPT Response Title interface  */}

        {/* // GPT response interface */}

        {/* // Image display */}

      </div>
    </div>
  );
}
