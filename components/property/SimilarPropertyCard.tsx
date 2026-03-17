'use client'

import Link from 'next/link'
import { Property } from '@/types/property'
import { HomeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { extractPlainText } from '@/lib/property-utils'
import { formatCurrency } from '@/lib/utils'

interface SimilarPropertyCardProps {
  property: Property
}

export function SimilarPropertyCard({ property }: SimilarPropertyCardProps) {
  const { isAuthenticated } = useAuth()

  const city = extractPlainText(property.city)
  const state = extractPlainText(property.state)

  return (
    <Link
      href={`/properties/${property.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 bg-gray-200">
        {property.cover_photo_url ? (
          <img
            src={property.cover_photo_url}
            alt={`Property in ${city}, ${state}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {isAuthenticated
            ? `${extractPlainText(property.street_address)}, ${city}, ${state}`
            : `${city}, ${state}`}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {city}, {state}
        </p>
        {property.monthly_rent && (
          <p className="text-lg font-bold text-navy">
            {formatCurrency(property.monthly_rent)}/mo
          </p>
        )}
      </div>
    </Link>
  )
}
