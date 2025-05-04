import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // File Type Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG and PNG files are allowed.' }, { status: 400 })
    }

    // File Size Validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 10MB.' }, { status: 400 })
    }
    
    // Generate unique filename with UUID
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const uniqueId = uuidv4().replace(/-/g, '')
    const newFileName = `image_${uniqueId}${fileExtension}`
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload S3 bucket using fetch and PUT with the new filename
    const uploadUrl = `${process.env.S3_BUCKET_URL}/${newFileName}`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: arrayBuffer,
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
      fileUrl: `${process.env.S3_BUCKET_URL}/${newFileName}`,
      fileName: newFileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 })
  }
}
