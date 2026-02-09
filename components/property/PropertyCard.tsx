import { Property } from '@/types/property'
import { formatCurrency } from '@/lib/utils'
import { MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'

interface PropertyCardProps {
  property: Property
  onEdit?: (property: Property) => void
  onDelete?: (property: Property) => void
  onView?: (property: Property) => void
  showActions?: boolean
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  onView,
  showActions = false,
}: PropertyCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {property.cover_photo_url ? (
          <img
            src={property.cover_photo_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {property.featured && (
          <div className="absolute top-2 left-2 bg-yellow text-navy px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${statusColors[property.status]}`}>
          {property.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-heading font-bold text-navy mb-2 truncate">
          {property.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="truncate">
            {property.city}, {property.state}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {property.beds && (
            <span>{property.beds} bed{property.beds > 1 ? 's' : ''}</span>
          )}
          {property.baths && <span>{property.baths} bath{property.baths > 1 ? 's' : ''}</span>}
          {property.square_footage && <span>{property.square_footage} sq ft</span>}
        </div>

        {property.monthly_rent && (
          <div className="flex items-center text-lg font-semibold text-navy mb-3">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            {formatCurrency(property.monthly_rent)}/mo
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-3 border-t">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(property)}
                className="flex-1"
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(property)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(property)}
                className="flex-1"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
