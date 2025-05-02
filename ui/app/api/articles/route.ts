import { NextResponse } from 'next/server'
import type { ArticleListItem } from '@/interface/Article'

export async function GET() {
  try {
    const apiBaseUrl = process.env.API_BASE_URL
    
    // Fetch data from the provided API endpoint
    const response = await fetch(`${apiBaseUrl}/all`, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store' // Disable caching to always get fresh data
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const s3BucketUrl = process.env.S3_BUCKET_URL

    // Map the API response to match our ArticleListItem interface
    const articles: ArticleListItem[] = data.map((item: any, index: number) => {
      // Extract first 100 characters as summary
      const summary = item.article?.substring(0, 100) + '...' || 'No summary available'
      
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
      
      return {
        id: index + 1,
        title: `Analysis of ${item.image_id || 'Image'}`,
        date,
        imageUrl: `${s3BucketUrl}/${encodeURIComponent(item.image_id)}`,
        summary,
        tags: item.DetectedLabels || []
      }
    })

    return NextResponse.json({
      articles
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Error fetching articles' },
      { status: 500 }
    )
  }
}