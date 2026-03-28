'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Dropdown, DropdownItem, DropdownLink, HoverDropdownLink } from '@/components/common/Dropdown'
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
  BriefcaseIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  HomeModernIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export function Header() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm relative z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Haven Housing Solutions
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
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

            {/* Services Dropdown - hover to reveal */}
            <Dropdown
              hover
              trigger={
                <Link href="/services" className="flex items-center gap-1 text-gray-700 hover:text-navy font-medium transition-colors">
                  Services
                  <ChevronDownIcon className="h-4 w-4" />
                </Link>
              }
            >
              <HoverDropdownLink href="/services/insurance" icon={ShieldCheckIcon}>
                Insurance
              </HoverDropdownLink>
              <HoverDropdownLink href="/services/corporate" icon={BriefcaseIcon}>
                Corporate
              </HoverDropdownLink>
              <HoverDropdownLink href="/services/government" icon={BuildingLibraryIcon}>
                Government
              </HoverDropdownLink>
            </Dropdown>

            <Link
              href="/properties"
              className="text-gray-700 hover:text-navy font-medium"
            >
              Properties
            </Link>
            {/* Contact Us Dropdown - hover to reveal */}
            <Dropdown
              hover
              trigger={
                <span className="flex items-center gap-1 text-gray-700 hover:text-navy font-medium transition-colors cursor-pointer">
                  Contact Us
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              }
            >
              <HoverDropdownLink href="/submit-housing-request" icon={ClipboardDocumentListIcon}>
                Submit a Housing Request
              </HoverDropdownLink>
              <HoverDropdownLink href="/submit-property" icon={HomeModernIcon}>
                Submit a Property
              </HoverDropdownLink>
              <HoverDropdownLink href="/contact" icon={EnvelopeIcon}>
                Send Us a Message
              </HoverDropdownLink>
            </Dropdown>
            <Link
              href="/submit-property"
              className="text-orange hover:text-orange-600 font-medium"
            >
              Submit a Property
            </Link>
          </div>

          {/* Right side: Auth + Mobile toggle */}
          <div className="flex items-center gap-2">
            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-4">
              {isAuthenticated ? (
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-sm">
                        {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:inline">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">About</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Services</Link>
            <div className="pl-6 space-y-1">
              <Link href="/services/insurance" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-gray-600 hover:text-navy">Insurance</Link>
              <Link href="/services/corporate" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-gray-600 hover:text-navy">Corporate</Link>
              <Link href="/services/government" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-gray-600 hover:text-navy">Government</Link>
            </div>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Properties</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Contact Us</Link>
            <Link href="/submit-property" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-orange hover:bg-orange/5 font-medium">Submit a Property</Link>

            {/* Mobile auth */}
            <div className="border-t border-gray-200 pt-3 mt-3 sm:hidden">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Signed in as {user?.full_name || user?.email?.split('@')[0]}
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Admin Dashboard</Link>
                  )}
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false) }} className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium">Sign Out</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
