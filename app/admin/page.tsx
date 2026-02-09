'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/common/Button'

interface DashboardStats {
  totalProperties: number
  publishedProperties: number
  draftProperties: number
  pendingSubmissions: number
  totalUsers: number
  recentProperties: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        propertiesResult,
        submissionsResult,
        usersResult,
        recentPropertiesResult,
      ] = await Promise.all([
        supabase.from('properties').select('status', { count: 'exact' }),
        supabase
          .from('property_submissions')
          .select('status', { count: 'exact' })
          .eq('status', 'pending'),
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const properties = propertiesResult.data || []
      const totalProperties = propertiesResult.count || 0
      const publishedProperties =
        properties.filter((p) => p.status === 'published').length
      const draftProperties = properties.filter((p) => p.status === 'draft').length

      setStats({
        totalProperties,
        publishedProperties,
        draftProperties,
        pendingSubmissions: submissionsResult.count || 0,
        totalUsers: usersResult.count || 0,
        recentProperties: recentPropertiesResult.data || [],
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      href: '/admin/properties',
    },
    {
      title: 'Published',
      value: stats.publishedProperties,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      href: '/admin/properties',
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions,
      icon: DocumentTextIcon,
      color: 'bg-orange',
      href: '/admin/submissions',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-navy',
      href: '/admin/users',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your property management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-navy mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-heading font-bold text-navy mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/properties">
            <Button variant="primary">Add New Property</Button>
          </Link>
          <Link href="/admin/submissions">
            <Button variant="outline">Review Submissions</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost">Manage Users</Button>
          </Link>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-navy">
            Recent Properties
          </h2>
          <Link href="/admin/properties">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {stats.recentProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {property.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {property.city}, {property.state}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            property.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(property.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No properties yet</p>
        )}
      </div>
    </div>
  )
}
