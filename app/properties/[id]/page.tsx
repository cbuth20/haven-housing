import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Property } from '@/types/property'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyAmenities } from '@/components/property/PropertyAmenities'
import { PropertyLocationMap } from '@/components/property/PropertyLocationMap'
import { Button } from '@/components/common/Button'
import { RequestToBookButton } from '@/components/property/RequestToBookButton'
import { BackToSearchButton } from '@/components/property/BackToSearchButton'
import { PropertyAddressHeading } from '@/components/property/PropertyAddress'
import { PropertyAuthDetails } from '@/components/property/PropertyAuthDetails'
import { AuthOnly } from '@/components/common/AuthOnly'
import { SimilarPropertyCard } from '@/components/property/SimilarPropertyCard'
import { formatCurrency } from '@/lib/utils'
import { extractPlainText } from '@/lib/property-utils'
import {
  MapPinIcon,
  LinkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

// NOTE: monthly_rent (and landlord/contact fields) are gated from logged-out
// visitors in the UI only (see <AuthOnly> / PropertyAuthDetails). This server
// component cannot strip them per-request because auth is client-only
// (implicit flow, no session cookie), so the values still ship in this single
// property's serialized payload. The bulk exposure via properties-search is
// closed server-side. Truly redacting here requires cookie-based SSR auth
// (@supabase/ssr) or client-fetching the gated fields for authenticated users.
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
  const streetAddress = extractPlainText(property.street_address)
  const city = extractPlainText(property.city)
  const state = extractPlainText(property.state)
  const zipCode = extractPlainText(property.zip_code)
  const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackToSearchButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <PropertyGallery images={images} propertyTitle={streetAddress} />
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <PropertyAddressHeading
                    streetAddress={streetAddress}
                    city={city}
                    state={state}
                    zipCode={zipCode}
                  />
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{city}, {state}</span>
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
                  <AuthOnly>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="text-2xl font-bold text-navy">
                        {formatCurrency(property.monthly_rent)}
                      </p>
                    </div>
                  </AuthOnly>
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

            {/* Map */}
            {hasCoordinates && (
              <>
                {/* Map */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-heading font-bold text-navy mb-4">
                    Location
                  </h2>
                  <PropertyLocationMap property={property} />
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
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Request to Book Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold text-navy mb-4">
                Interested in This Property?
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Submit a request and our team will get back to you with availability and next steps.
              </p>

              <RequestToBookButton
                propertyTitle={streetAddress}
                propertyAddress={fullAddress}
              />

              <PropertyAuthDetails
                listingLink={property.listing_link}
                landlordName={property.landlord_name}
                landlordEmail={property.landlord_email}
                landlordPhone={property.landlord_phone}
              />
            </div>

            {/* Share */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Share this property</h3>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                <ShareIcon className="h-4 w-4 mr-2 flex-shrink-0" />
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
                <SimilarPropertyCard key={similar.id} property={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
