'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Dropdown, DropdownItem, DropdownLink } from '@/components/common/Dropdown'
import { useRouter } from 'next/navigation'
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChevronDownIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      console.log('🔓 Sign out clicked')
      await signOut()
      console.log('🔓 Sign out successful, redirecting...')
      router.push('/')
    } catch (error) {
      console.error('🔓 Sign out error:', error)
    }
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

            {/* Services Dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-1 text-gray-700 hover:text-navy font-medium transition-colors">
                  Services
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              }
            >
              <DropdownLink href="/services/government" icon={BuildingLibraryIcon}>
                Government
              </DropdownLink>
              <DropdownLink href="/services/insurance" icon={ShieldCheckIcon}>
                Insurance
              </DropdownLink>
              <DropdownLink href="/services/corporate" icon={BriefcaseIcon}>
                Corporate
              </DropdownLink>
            </Dropdown>

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
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-sm">
                      {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.full_name || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </button>
                }
              >
                {isAdmin && (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Admin
                      </p>
                    </div>
                    <DropdownLink href="/admin" icon={HomeIcon}>
                      Dashboard
                    </DropdownLink>
                    <DropdownLink href="/admin/properties" icon={BuildingOfficeIcon}>
                      Properties
                    </DropdownLink>
                    <DropdownLink href="/admin/submissions" icon={DocumentTextIcon}>
                      Submissions
                    </DropdownLink>
                    <DropdownLink href="/admin/users" icon={UsersIcon}>
                      Users
                    </DropdownLink>
                    <div className="border-t border-gray-200 my-1"></div>
                  </>
                )}
                <DropdownItem onClick={handleSignOut} icon={ArrowRightOnRectangleIcon} danger>
                  Sign Out
                </DropdownItem>
              </Dropdown>
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
