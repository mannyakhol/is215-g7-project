"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { ArticleListItem } from "@/interface/Article"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 3

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

  // Calculate pagination values
  const totalArticles = articles.length
  const totalPages = Math.ceil(totalArticles / articlesPerPage)
  const indexOfLastArticle = currentPage * articlesPerPage
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle)

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: number[] = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(currentPage + 1, totalPages - 1)
      
      // Adjust to show max pages
      if (endPage - startPage < 2) {
        if (currentPage < totalPages / 2) {
          endPage = Math.min(startPage + 2, totalPages - 1)
        } else {
          startPage = Math.max(endPage - 2, 2)
        }
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(-1) // Use -1 to represent ellipsis
      }
      
      // Add page numbers in range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2) // Use -2 to represent ellipsis
      }
      
      // Always show last page
      pageNumbers.push(totalPages)
    }
    
    return pageNumbers
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
          <>
            <div className="grid gap-6 mb-8">
              {currentArticles.map((article) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => paginate(currentPage - 1)}
                      style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((number, index) => (
                    <PaginationItem key={index}>
                      {number === -1 || number === -2 ? (
                        <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                      ) : (
                        <PaginationLink 
                          onClick={() => paginate(number)}
                          isActive={currentPage === number}
                          style={{ cursor: 'pointer' }}
                        >
                          {number}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => paginate(currentPage + 1)}
                      style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
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
