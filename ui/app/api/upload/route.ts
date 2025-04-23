import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Optionally, you can add further validation (e.g., file size, type)
    if (file.size > 10 * 1024 * 1024) { // Example: Limit file size to 10MB
      return NextResponse.json({ error: 'File is too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload directly to public-write S3 bucket using fetch and PUT
    const uploadUrl = `https://is215-upload-test1.s3.amazonaws.com/${encodeURIComponent(file.name)}`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: arrayBuffer,  // Use ArrayBuffer here
      headers: {
        "Content-Type": file.type,
      }
    })

    if (!response.ok) {
      console.error('S3 upload failed:', await response.text())
      return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 })
    }

    // Return success with the uploaded file URL
    return NextResponse.json({
      success: true,
      message: 'File uploaded to S3 successfully',
      fileUrl: `https://is215-upload-test1.s3.amazonaws.com/${encodeURIComponent(file.name)}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 })
  }
}
