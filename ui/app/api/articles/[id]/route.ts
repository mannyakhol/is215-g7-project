import { NextResponse } from 'next/server'
import type { ArticleItem } from '@/interface/Article'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id) - 1 // Convert to zero-based index
    
    if (isNaN(id) || id < 0) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    const apiBaseUrl = process.env.API_BASE_URL
    
    // Fetch all data from the API
    const response = await fetch(`${apiBaseUrl}/all`, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if the requested article exists in the response
    if (!data[id]) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const item = data[id]
    const s3BucketUrl = process.env.S3_BUCKET_URL
    
    // Get date from timestamp or use current date
    let date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (item.Timestamp) {
      try {
        const timestamp = new Date(item.Timestamp)
        date = timestamp.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      } catch (e) {
        console.error('Error parsing timestamp:', e)
      }
    }

    // Map to ArticleItem format
    const article: ArticleItem = {
      id: parseInt(params.id),
      title: `Analysis of ${item.image_id || 'Image'}`,
      date,
      imageUrl: `${s3BucketUrl}/${encodeURIComponent(item.image_id)}`,
      content: item.article || 'No content available',
      tags: item.DetectedLabels || []
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Error fetching article' },
      { status: 500 }
    )
  }
}