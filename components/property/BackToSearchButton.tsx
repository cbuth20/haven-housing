'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export function BackToSearchButton() {
  const router = useRouter()

  const handleBack = () => {
    // Use browser back to preserve the previous search state/filters
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/properties')
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleBack}>
      <ArrowLeftIcon className="h-4 w-4 mr-2" />
      Back to Search
    </Button>
  )
}
