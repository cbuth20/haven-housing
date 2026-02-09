'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-heading font-bold text-navy">
                Haven Housing
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-navy font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-navy font-medium"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-gray-700 hover:text-navy font-medium"
            >
              Services
            </Link>
            <Link
              href="/properties"
              className="text-gray-700 hover:text-navy font-medium"
            >
              Properties
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-navy font-medium"
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-orange hover:text-orange-600 font-medium"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.full_name || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
