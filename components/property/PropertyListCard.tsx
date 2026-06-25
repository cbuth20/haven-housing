'use client'

import { Property } from '@/types/property'
import { HomeIcon, MapPinIcon, CurrencyDollarIcon, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { getPropertyDisplayTitle, extractPlainText } from '@/lib/property-utils'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface PropertyListCardProps {
  property: Property
  onClick?: () => void
  showDistance?: boolean
}

export function PropertyListCard({ property, onClick, showDistance = false }: PropertyListCardProps) {
  const { isAuthenticated } = useAuth()
  const hasImage = !!property.cover_photo_url

  // Parse amenities
  const amenities = property.other_amenities || []
  const featuredAmenities = amenities.slice(0, 3)

  // Pet friendly check
  const isPetFriendly = property.pet_policy?.toLowerCase().includes('allowed') ||
    property.pet_policy?.toLowerCase().includes('yes')

  const title = isAuthenticated
    ? getPropertyDisplayTitle(property)
    : `${extractPlainText(property.city)}, ${extractPlainText(property.state)} ${extractPlainText(property.zip_code)}`

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      {/* Mobile: vertical stack / Desktop: horizontal */}
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-56 h-40 sm:h-44 bg-gray-200 flex-shrink-0">
          {hasImage ? (
            <Image
              src={property.cover_photo_url!}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 224px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <HomeIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-row sm:flex-col gap-1">
            {property.featured && (
              <div className="bg-orange text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-lg">
                <SparklesIconSolid className="h-3 w-3" />
                Featured
              </div>
            )}
            {property.furnish_level && (
              <div className="bg-navy text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
                {property.furnish_level}
              </div>
            )}
          </div>

          {/* Price badge on mobile (overlaid on image) — hidden from logged-out visitors */}
          {isAuthenticated && property.monthly_rent && (
            <div className="sm:hidden absolute bottom-2 left-2 bg-navy/90 backdrop-blur text-white px-2.5 py-1 rounded-lg shadow-lg">
              <span className="text-base font-bold">{formatCurrency(property.monthly_rent)}</span>
              <span className="text-xs opacity-80">/mo</span>
            </div>
          )}

          {/* Distance Badge */}
          {showDistance && property.distance && (
            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-navy shadow-lg">
              {property.distance.toFixed(1)} mi
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-navy group-hover:text-orange transition-colors line-clamp-1 flex-1">
                {title}
              </h3>
              {/* Price on desktop only (inline) — hidden from logged-out visitors */}
              {isAuthenticated && property.monthly_rent && (
                <div className="hidden sm:block flex-shrink-0">
                  <p className="text-xl font-bold text-navy">
                    {formatCurrency(property.monthly_rent)}
                  </p>
                  <p className="text-xs text-gray-500 text-right">per month</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-600 mb-2 sm:mb-3">
              <MapPinIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm truncate">
                {isAuthenticated && property.street_address && `${extractPlainText(property.street_address)}, `}
                {extractPlainText(property.city)}, {extractPlainText(property.state)} {!isAuthenticated ? '' : extractPlainText(property.zip_code)}
              </p>
            </div>

            {/* Key Details — compact on mobile */}
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
              {property.unit_type && (
                <div className="flex items-center gap-1">
                  <HomeIconSolid className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-navy" />
                  <span>{property.unit_type}</span>
                </div>
              )}
              {property.beds !== null && property.beds !== undefined && (
                <span className="font-medium">{property.beds} Bed{property.beds !== 1 ? 's' : ''}</span>
              )}
              {property.baths !== null && property.baths !== undefined && (
                <span className="font-medium">{property.baths} Bath{property.baths !== 1 ? 's' : ''}</span>
              )}
              {/* Square footage: hidden on mobile */}
              {property.square_footage && (
                <span className="hidden sm:inline text-gray-600">{property.square_footage.toLocaleString()} sq ft</span>
              )}
            </div>

            {/* Amenities Pills — hidden on mobile */}
            {featuredAmenities.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1 mb-2">
                {featuredAmenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
                {amenities.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                    +{amenities.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
              {isPetFriendly && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckBadgeIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  <span className="hidden sm:inline">Pet Friendly</span>
                  <span className="sm:hidden">Pets OK</span>
                </span>
              )}
              {property.parking && (
                <span className="truncate hidden sm:inline">{property.parking}</span>
              )}
            </div>

            <button className="text-orange font-semibold text-xs sm:text-sm group-hover:underline flex-shrink-0">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
