'use client'

import { Property } from '@/types/property'
import { HomeIcon, MapPinIcon, CurrencyDollarIcon, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { getPropertyDisplayTitle } from '@/lib/property-utils'

interface PropertyListCardProps {
  property: Property
  onClick?: () => void
  showDistance?: boolean
}

export function PropertyListCard({ property, onClick, showDistance = false }: PropertyListCardProps) {
  const hasImage = !!property.cover_photo_url

  // Parse amenities
  const amenities = property.other_amenities || []
  const featuredAmenities = amenities.slice(0, 3)

  // Pet friendly check
  const isPetFriendly = property.pet_policy?.toLowerCase().includes('allowed') ||
    property.pet_policy?.toLowerCase().includes('yes')

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-56 h-44 bg-gray-200 flex-shrink-0">
          {hasImage ? (
            <Image
              src={property.cover_photo_url!}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="224px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <HomeIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
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

          {/* Distance Badge */}
          {showDistance && property.distance && (
            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-navy shadow-lg">
              {property.distance.toFixed(1)} mi
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold text-navy group-hover:text-orange transition-colors line-clamp-1 flex-1">
                {getPropertyDisplayTitle(property)}
              </h3>
              {property.monthly_rent && (
                <div className="flex-shrink-0">
                  <p className="text-xl font-bold text-navy">
                    ${property.monthly_rent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 text-right">per month</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-600 mb-3">
              <MapPinIcon className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm truncate">
                {property.street_address && `${property.street_address}, `}
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>

            {/* Key Details */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-3">
              {property.unit_type && (
                <div className="flex items-center gap-1">
                  <HomeIconSolid className="h-4 w-4 text-navy" />
                  <span>{property.unit_type}</span>
                </div>
              )}
              {property.beds !== null && property.beds !== undefined && (
                <span className="font-medium">{property.beds} Bed{property.beds !== 1 ? 's' : ''}</span>
              )}
              {property.baths !== null && property.baths !== undefined && (
                <span className="font-medium">{property.baths} Bath{property.baths !== 1 ? 's' : ''}</span>
              )}
              {property.square_footage && (
                <span className="text-gray-600">{property.square_footage.toLocaleString()} sq ft</span>
              )}
            </div>

            {/* Amenities Pills */}
            {featuredAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
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
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {isPetFriendly && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckBadgeIcon className="h-4 w-4" />
                  Pet Friendly
                </span>
              )}
              {property.parking && (
                <span className="truncate">{property.parking}</span>
              )}
            </div>

            <button className="text-orange font-semibold text-sm group-hover:underline">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
