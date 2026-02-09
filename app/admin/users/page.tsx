'use client'

import { UsersIcon } from '@heroicons/react/24/outline'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">
          User Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-600">
          User management functionality will be available soon.
          <br />
          For now, manage users directly in Supabase Dashboard.
        </p>
      </div>
    </div>
  )
}
