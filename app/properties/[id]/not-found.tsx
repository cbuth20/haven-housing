import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <HomeIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-heading font-bold text-navy mb-4">
          Property Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The property you're looking for doesn't exist or is no longer available.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/properties">
            <Button variant="primary">Browse All Properties</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
