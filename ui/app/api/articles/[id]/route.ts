import { NextResponse } from 'next/server'
import articles from '../articles.json' // TODO: Remove

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Fetch from article by ID in DB

    const article = articles.find(a => a.id === parseInt(params.id))
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
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