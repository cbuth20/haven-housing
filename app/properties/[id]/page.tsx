import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { Property } from '@/types/property'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyAmenities } from '@/components/property/PropertyAmenities'
import { StreetViewEmbed } from '@/components/maps/StreetViewEmbed'
import { MapView } from '@/components/maps/MapView'
import { Button } from '@/components/common/Button'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeftIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
  LinkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProperty(id: string): Promise<Property | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  return data
}

async function getSimilarProperties(property: Property): Promise<Property[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'published')
    .eq('city', property.city)
    .neq('id', property.id)
    .limit(3)

  return data || []
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  const similarProperties = await getSimilarProperties(property)
  const images = property.media_gallery_urls || []
  if (property.cover_photo_url && !images.includes(property.cover_photo_url)) {
    images.unshift(property.cover_photo_url)
  }

  const hasCoordinates = property.latitude && property.longitude
  const fullAddress = `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <PropertyGallery images={images} propertyTitle={property.title} />
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-navy mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{fullAddress}</span>
                  </div>
                </div>
                {property.featured && (
                  <span className="bg-yellow text-navy px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
                {property.beds !== null && (
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="text-2xl font-bold text-navy">{property.beds}</p>
                  </div>
                )}
                {property.baths !== null && (
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="text-2xl font-bold text-navy">{property.baths}</p>
                  </div>
                )}
                {property.square_footage && (
                  <div>
                    <p className="text-sm text-gray-600">Square Feet</p>
                    <p className="text-2xl font-bold text-navy">
                      {property.square_footage.toLocaleString()}
                    </p>
                  </div>
                )}
                {property.monthly_rent && (
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="text-2xl font-bold text-navy">
                      {formatCurrency(property.monthly_rent)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Unit Type */}
              {property.unit_type && (
                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-3">
                    Property Type
                  </h2>
                  <p className="text-gray-700">{property.unit_type}</p>
                </div>
              )}

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-heading font-bold text-navy mb-4">
                  Amenities
                </h2>
                <PropertyAmenities
                  laundry={property.laundry}
                  parking={property.parking}
                  petPolicy={property.pet_policy}
                  furnishLevel={property.furnish_level}
                  otherAmenities={property.other_amenities}
                />
              </div>
            </div>

            {/* Map & Street View */}
            {hasCoordinates && (
              <>
                {/* Street View */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-4">
                    Street View
                  </h2>
                  <StreetViewEmbed
                    latitude={Number(property.latitude)}
                    longitude={Number(property.longitude)}
                    address={fullAddress}
                    className="w-full h-96"
                  />
                </div>

                {/* Map */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-4">
                    Location
                  </h2>
                  <MapView
                    properties={[property]}
                    center={{
                      lat: Number(property.latitude),
                      lng: Number(property.longitude),
                    }}
                    zoom={15}
                    className="w-full h-96"
                  />
                </div>

                {/* Walk Score */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-4">
                    Walk Score
                  </h2>
                  <p className="text-gray-600 mb-4">
                    See how walkable this location is and what amenities are nearby.
                  </p>
                  <a
                    href={`https://www.walkscore.com/score/${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-navy hover:text-navy-700 font-semibold"
                  >
                    View Walk Score
                    <LinkIcon className="h-5 w-5" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-heading font-bold text-navy mb-4">
                Contact Information
              </h2>

              {property.landlord_name && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Landlord</p>
                  <p className="font-semibold text-gray-900">{property.landlord_name}</p>
                </div>
              )}

              {property.landlord_email && (
                <a
                  href={`mailto:${property.landlord_email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                >
                  <EnvelopeIcon className="h-5 w-5 text-navy" />
                  <span className="text-gray-900">{property.landlord_email}</span>
                </a>
              )}

              {property.landlord_phone && (
                <a
                  href={`tel:${property.landlord_phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                >
                  <PhoneIcon className="h-5 w-5 text-navy" />
                  <span className="text-gray-900">{property.landlord_phone}</span>
                </a>
              )}

              {property.listing_link && (
                <a
                  href={property.listing_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                >
                  <LinkIcon className="h-5 w-5 text-navy" />
                  <span className="text-gray-900">View Original Listing</span>
                </a>
              )}

              {!property.landlord_email && !property.landlord_phone && (
                <p className="text-gray-500 text-sm">
                  Contact information not available. Please check back later.
                </p>
              )}

              <Button variant="primary" className="w-full mt-4">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Request Information
              </Button>
            </div>

            {/* Share */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Share this property</h3>
              <Button variant="outline" className="w-full">
                <ShareIcon className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-heading font-bold text-navy mb-6">
              Similar Properties in {property.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/properties/${similar.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200">
                    {similar.cover_photo_url ? (
                      <img
                        src={similar.cover_photo_url}
                        alt={similar.title}
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
                      {similar.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {similar.city}, {similar.state}
                    </p>
                    {similar.monthly_rent && (
                      <p className="text-lg font-bold text-navy">
                        {formatCurrency(similar.monthly_rent)}/mo
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
