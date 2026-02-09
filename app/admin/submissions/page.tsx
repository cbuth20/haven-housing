'use client'

import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function SubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">
          Property Submissions
        </h1>
        <p className="text-gray-600 mt-2">
          Review and approve property submissions from the public
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-600">
          Property submission review functionality will be available soon.
          <br />
          This feature is part of Phase 3 implementation.
        </p>
      </div>
    </div>
  )
}
