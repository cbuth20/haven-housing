import { CheckCircleIcon } from '@heroicons/react/24/outline'

/* Inline SVG icons for precise amenity matching */

function LaundryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5M3.75 4.5v15a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-15M3.75 4.5l.75-2.25h15l.75 2.25M12 15a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM6.75 6.75h.008v.008H6.75V6.75zm1.5 0h.008v.008h-.008V6.75z" />
    </svg>
  )
}

function ParkingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3m0 0A2.25 2.25 0 0018 12.75H6A2.25 2.25 0 003.75 15v2.25m14.5-2.25h.008v.008h-.008V15zm-1.5 0h.008v.008h-.008V15zM3.75 12h16.5m-16.5 0V6.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125V12" />
    </svg>
  )
}

function PetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  )
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

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
    { label: 'Laundry', value: laundry, icon: LaundryIcon },
    { label: 'Parking', value: parking, icon: ParkingIcon },
    { label: 'Pet Policy', value: petPolicy, icon: PetIcon },
    { label: 'Furnishing', value: furnishLevel, icon: BedIcon },
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
