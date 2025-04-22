"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { ArticleListItem } from "@/interface/article"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (!response.ok) throw new Error('Failed to fetch articles')
      
      const data = await response.json()
      setArticles(data.articles)
    } catch (err) {
      setError('Failed to load articles')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchArticles} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">All Articles</h1>
        <p className="text-muted-foreground mb-6">View all articles generated from your images.</p>

        {articles.length > 0 ? (
          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto bg-muted">
                    <img
                      src={article.imageUrl || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{article.date}</span>
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-muted-foreground">{article.summary}</p>
                    </CardContent>
                    <CardFooter className="mt-auto pt-2">
                      <Button asChild variant="outline" className="gap-2 group">
                        <Link href={`/articles/${article.id}`}>
                          Read Full Article
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center border-dashed border-2">
            <CardContent>
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Articles Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't generated any articles yet. Upload images to create your first article.
              </p>
              <Button asChild>
                <Link href="/upload">Upload Images</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
