"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function NavHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    {
      name: "Upload Image",
      href: "/upload",
      description: "Upload images to generate articles using ChatGPT",
    },
    {
      name: "View Articles",
      href: "/articles",
      description: "View all generated articles",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl md:text-2xl">
            IS215 Group 7 Project
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                pathname === item.href
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.name}
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary origin-left scale-x-0 transition-transform group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-full p-2 hover:bg-muted transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 pb-6 border-b animate-in slide-in-from-top-5 duration-300">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-3 rounded-lg transition-colors hover:bg-muted",
                  pathname === item.href ? "bg-muted/50 text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="font-medium">{item.name}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
