'use client'

import { useState } from 'react'
import { Property } from '@/types/property'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import {
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { getPropertyDisplayTitle } from '@/lib/property-utils'

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (property: Property) => void
  onDelete?: (property: Property) => void
}

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: PropertyDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!property) return null

  const images = [
    property.cover_photo_url,
    ...(property.media_gallery_urls || []),
  ].filter(Boolean)

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    archived: 'bg-red-100 text-red-800',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedImageIndex(0)
        onClose()
      }}
      title={getPropertyDisplayTitle(property)}
      size="full"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[property.status as keyof typeof statusColors]
              }`}
            >
              {property.status}
            </span>
            {property.featured && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(property)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(property)}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImageIndex]}
                alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? 'border-navy shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location
            </h3>
            <div className="text-gray-700">
              <p>{property.street_address}</p>
              <p>
                {property.city}, {property.state} {property.zip_code}
              </p>
              <p>{property.country}</p>
            </div>
            {property.latitude && property.longitude && (
              <p className="text-sm text-gray-500">
                Coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Property Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Property Details
            </h3>
            <div className="space-y-1 text-gray-700">
              {property.unit_type && <p>Type: {property.unit_type}</p>}
              {property.square_footage && (
                <p>Size: {property.square_footage.toLocaleString()} sq ft</p>
              )}
              <p>
                Bedrooms: {property.beds || 'N/A'} | Bathrooms: {property.baths || 'N/A'}
              </p>
              {property.furnish_level && <p>Furnishing: {property.furnish_level}</p>}
            </div>
          </div>

          {/* Amenities */}
          {(property.laundry || property.parking || property.pet_policy || property.other_amenities) && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-navy">Amenities</h3>
              <div className="space-y-1 text-gray-700">
                {property.laundry && <p>• Laundry: {property.laundry}</p>}
                {property.parking && <p>• Parking: {property.parking}</p>}
                {property.pet_policy && <p>• Pets: {property.pet_policy}</p>}
                {property.other_amenities && property.other_amenities.length > 0 && (
                  <div>
                    <p className="font-medium mt-2">Other Amenities:</p>
                    <ul className="list-disc list-inside ml-2">
                      {property.other_amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing & Landlord */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              Pricing & Contact
            </h3>
            <div className="space-y-1 text-gray-700">
              {property.monthly_rent && (
                <p className="text-xl font-bold text-navy">
                  ${property.monthly_rent.toLocaleString()}/month
                </p>
              )}
              {property.landlord_name && (
                <div className="mt-4">
                  <p className="font-medium">Landlord: {property.landlord_name}</p>
                  {property.landlord_email && (
                    <p className="text-sm">{property.landlord_email}</p>
                  )}
                  {property.landlord_phone && (
                    <p className="text-sm">{property.landlord_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>
        )}

        {/* Listing Link */}
        {property.listing_link && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy">Listing</h3>
            <a
              href={property.listing_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline break-all"
            >
              {property.listing_link}
            </a>
          </div>
        )}

        {/* Additional Details */}
        {(property.laundry || property.furnish_level) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy">Additional Details</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {property.furnish_level && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Furnishing</p>
                  <p className="font-medium text-navy">{property.furnish_level}</p>
                </div>
              )}
              {property.laundry && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Laundry</p>
                  <p className="font-medium text-navy">{property.laundry}</p>
                </div>
              )}
              {property.unit_type && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-medium text-navy">{property.unit_type}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">System Information</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium">{new Date(property.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
            {property.updated_at && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(property.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            )}
            {property.wix_id && (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Wix ID</p>
                  <p className="font-mono text-xs">{property.wix_id.substring(0, 24)}...</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Property ID</p>
                <p className="font-mono text-xs">{property.id.substring(0, 24)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
