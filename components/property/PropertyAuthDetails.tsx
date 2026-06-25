'use client'

import { LinkIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { AuthOnly } from '@/components/common/AuthOnly'

interface PropertyAuthDetailsProps {
  listingLink: string | null
  landlordName: string | null
  landlordEmail: string | null
  landlordPhone: string | null
}

export function PropertyAuthDetails({
  listingLink,
  landlordName,
  landlordEmail,
  landlordPhone,
}: PropertyAuthDetailsProps) {
  const hasLandlordInfo = landlordName || landlordEmail || landlordPhone

  return (
    <AuthOnly>
      {listingLink && (
        <a
          href={listingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mt-3"
        >
          <LinkIcon className="h-4 w-4 text-navy" />
          <span className="text-gray-900">View Original Listing</span>
        </a>
      )}

      {hasLandlordInfo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Landlord Contact</h3>
          <div className="space-y-1.5">
            {landlordName && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span>{landlordName}</span>
              </div>
            )}
            {landlordEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${landlordEmail}`} className="hover:text-navy transition-colors">
                  {landlordEmail}
                </a>
              </div>
            )}
            {landlordPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <a href={`tel:${landlordPhone}`} className="hover:text-navy transition-colors">
                  {landlordPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthOnly>
  )
}
