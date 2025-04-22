import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block mb-4 rounded-full px-3 py-1 text-sm bg-muted">IS215 Group 7 Project</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Transform Images into Articles with AI</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Upload your images and let ChatGPT generate engaging articles automatically. A powerful tool for content
          creation and storytelling.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/articles" className="gap-2">
              <FileText className="h-4 w-4" />
              View Articles
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Images</h3>
            <p className="text-sm text-muted-foreground text-center">
              Simply upload your images through our intuitive interface.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">AI Processing</h3>
            <p className="text-sm text-muted-foreground text-center">
              Our AI analyzes your images and generates relevant content.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Get Articles</h3>
            <p className="text-sm text-muted-foreground text-center">
              Review and use the generated articles for your content needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
