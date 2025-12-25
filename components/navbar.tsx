"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">GT</span>
          </div>
          <span className="text-lg font-semibold text-foreground">GetTranscript</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Blog
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
          <ThemeToggle />
          {status === "authenticated" ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/account">Account</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/features" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            {status === "authenticated" ? (
              <Button asChild size="sm" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/account">Account</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
