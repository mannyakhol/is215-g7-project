import { NextResponse } from 'next/server'
import articles from './articles.json'  // TODO: Remove

export async function GET() {
  try {
    // TODO: Fetch from article list in DB
    
    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        content: undefined
      }))
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Error fetching articles' },
      { status: 500 }
    )
  }
} 