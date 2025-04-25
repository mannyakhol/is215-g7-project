import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // File Validation
    if (file.size > 1 * 1024 * 1024) {
      console.log('File too large, rejecting upload')
      return NextResponse.json({ error: 'File is too large. Maximum size is 1MB.' }, { status: 400 }) // please check
    }
    

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload S3 bucket using fetch and PUT
    const uploadUrl = `${process.env.S3_BUCKET_URL}/${encodeURIComponent(file.name)}`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: arrayBuffer,  // Use ArrayBuffer
      headers: {
        "Content-Type": file.type,
      }
    })

    if (!response.ok) {
      console.error('S3 upload failed:', await response.text())
      return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded to S3 successfully',
      fileUrl: `${process.env.S3_BUCKET_URL}/${encodeURIComponent(file.name)}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 })
  }
}
