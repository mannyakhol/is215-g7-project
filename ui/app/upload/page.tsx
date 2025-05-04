"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Check, ImageIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "complete" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // List of allowed file types
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']

  // Function to validate file type
  const validateFileType = (file: File): boolean => {
    if (!allowedFileTypes.includes(file.type)) {
      setErrorMessage(`Invalid file type. Only JPG and PNG files are accepted.`)
      return false
    }
    setErrorMessage(null)
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!validateFileType(file)) {
        setSelectedFile(null)
        setPreviewUrl(null)
        return
      }
      
      setSelectedFile(file)

      // Create preview URL
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string)
      }
      fileReader.readAsDataURL(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      
      // Validate file type
      if (!validateFileType(file)) {
        setSelectedFile(null)
        setPreviewUrl(null)
        return
      }
      
      setSelectedFile(file)

      // Create preview URL
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string)
      }
      fileReader.readAsDataURL(file)
    }
  }, [])

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setUploadState("idle")
    setErrorMessage(null)
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadState('uploading')
      setProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setProgress(100)
      setUploadState('complete')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadState('error')
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadFile(selectedFile)
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6 md:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Upload Image</h1>
        <p className="text-muted-foreground mb-6">Upload an image that will be turned into an article using ChatGPT.</p>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Image Upload
            </CardTitle>
            <CardDescription>
              Select an image to generate an article. Only JPG and PNG formats are supported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadState === "idle" && (
              <>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!previewUrl ? (
                    <div className="mx-auto flex flex-col items-center justify-center gap-1 py-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-muted-foreground text-sm text-center">
                        Drag and drop your image here or click to browse
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Only JPG and PNG files are accepted
                      </div>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile?.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetUpload()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative w-full max-w-md mx-auto aspect-video rounded-md overflow-hidden">
                        <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Error message */}
                {errorMessage && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </>
            )}

            {uploadState === "uploading" && (
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading image...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center animate-pulse">
                  Please wait while we upload your image...
                </p>
              </div>
            )}

            {uploadState === "complete" && (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">Upload Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">Your image has been uploaded successfully.</p>
                <Progress value={100} className="h-2 bg-green-100 dark:bg-green-900" />
                <p className="text-sm text-muted-foreground mt-4">
                  Your image is now being processed to generate an article.
                </p>
              </div>
            )}

            {uploadState === "error" && (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">Upload Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There was an error uploading your image. Please try again.
                </p>
                <Button variant="outline" onClick={resetUpload}>
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            {uploadState === "idle" && (
              <>
                <Button variant="outline" onClick={resetUpload} disabled={!selectedFile}>
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile}>
                  Upload & Generate Article
                </Button>
              </>
            )}

            {uploadState === "uploading" && (
              <>
                <Button variant="outline" disabled>
                  Cancel
                </Button>
                <Button disabled>Processing...</Button>
              </>
            )}

            {uploadState === "complete" && (
              <>
                <Button variant="outline" onClick={resetUpload}>
                  Upload Another
                </Button>
                <Button asChild>
                  <Link href="/articles">View Generated Article</Link>
                </Button>
              </>
            )}

            {uploadState === "error" && (
              <>
                <Button variant="outline" onClick={resetUpload}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={resetUpload}>
                  Try Again
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
