import {
  HomeIcon,
  SparklesIcon,
  TruckIcon,
  FireIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface PropertyAmenitiesProps {
  laundry?: string | null
  parking?: string | null
  petPolicy?: string | null
  furnishLevel?: string | null
  otherAmenities?: string[] | null
}

export function PropertyAmenities({
  laundry,
  parking,
  petPolicy,
  furnishLevel,
  otherAmenities,
}: PropertyAmenitiesProps) {
  const amenities = [
    { label: 'Laundry', value: laundry, icon: SparklesIcon },
    { label: 'Parking', value: parking, icon: TruckIcon },
    { label: 'Pet Policy', value: petPolicy, icon: HomeIcon },
    { label: 'Furnishing', value: furnishLevel, icon: HomeIcon },
  ].filter((amenity) => amenity.value)

  if (amenities.length === 0 && (!otherAmenities || otherAmenities.length === 0)) {
    return (
      <div className="text-center py-8 text-gray-500">
        No amenities information available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Amenities */}
      {amenities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenities.map((amenity) => {
            const Icon = amenity.icon
            return (
              <div
                key={amenity.label}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{amenity.label}</p>
                  <p className="font-semibold text-gray-900">{amenity.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Other Amenities */}
      {otherAmenities && otherAmenities.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Additional Amenities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {otherAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
