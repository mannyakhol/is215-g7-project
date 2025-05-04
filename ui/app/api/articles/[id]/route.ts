import { NextResponse } from 'next/server'
import type { ArticleItem } from '@/interface/Article'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the requested ID
    const requestedId = context.params.id
    
    const apiBaseUrl = process.env.API_BASE_URL
    const s3BucketUrl = process.env.S3_BUCKET_URL
    
    // Use the new dedicated endpoint for getting article by ID
    const response = await fetch(`${apiBaseUrl}/articles?id=${requestedId}`, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const item = await response.json()
    
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
      id: item.id || requestedId,
      title: item.title || 'Article is still being generated',
      date,
      imageUrl: `${s3BucketUrl}/${encodeURIComponent(item.image_id)}`,
      content: item.article || 'No content available yet.',
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