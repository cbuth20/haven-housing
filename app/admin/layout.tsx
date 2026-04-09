'use client'

import { useEffect, useState } from 'react'
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
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
    if (!isLoading && user && !user.is_onboarded) {
      router.push('/onboard')
    }
  }, [isLoading, isAdmin, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAdmin || (user && !user.is_onboarded)) {
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
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: UserCircleIcon,
      current: pathname === '/admin/profile',
    },
  ]

  const sidebarContent = (
    <>
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
              onClick={() => setSidebarOpen(false)}
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
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header bar */}
      <div className="lg:hidden bg-navy text-white flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-heading font-bold">Haven Housing</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-navy-700">
          {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-navy flex flex-col z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-52px)] lg:h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 bg-navy flex-shrink-0 flex-col">
          {sidebarContent}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
