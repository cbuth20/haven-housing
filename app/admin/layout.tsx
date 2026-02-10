'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAdmin } = useAuth()

  useEffect(() => {
    console.log('🔐 Admin Layout Auth Check:', { isLoading, isAdmin, user })
    if (!isLoading && !isAdmin) {
      console.log('❌ Not admin, redirecting to login')
      router.push('/login')
    }
  }, [isLoading, isAdmin, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      current: false,
    },
    {
      name: 'Dashboard',
      href: '/admin',
      icon: ChartBarIcon,
      current: pathname === '/admin',
    },
    {
      name: 'Properties',
      href: '/admin/properties',
      icon: BuildingOfficeIcon,
      current: pathname === '/admin/properties',
    },
    {
      name: 'Submissions',
      href: '/admin/submissions',
      icon: DocumentTextIcon,
      current: pathname === '/admin/submissions',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      current: pathname === '/admin/users',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-navy flex-shrink-0 flex flex-col">
          {/* Logo/Branding */}
          <div className="p-6 border-b border-navy-700">
            <h1 className="text-xl font-heading font-bold text-white">
              Haven Housing
            </h1>
            <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      item.current
                        ? 'bg-navy-700 text-white'
                        : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
