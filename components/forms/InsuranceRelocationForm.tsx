'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  claimNumber: z.string().optional(),
  insuranceCompany: z.string().min(2, 'Insurance company is required'),
  desiredLocation: z.string().min(2, 'Location is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  numberOfBedrooms: z.string().min(1, 'Number of bedrooms is required'),
  numberOfOccupants: z.string().min(1, 'Number of occupants is required'),
  pets: z.enum(['yes', 'no']),
  petDetails: z.string().optional(),
  additionalNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function InsuranceRelocationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const hasPets = watch('pets')

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/.netlify/functions/form-submit-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitSuccess(true)
      reset()
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-heading font-bold text-green-900 mb-2">
          Thank You!
        </h3>
        <p className="text-green-800 mb-4">
          We've received your insurance relocation request. Our team will contact you within 24 hours.
        </p>
        <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
          Submit Another Request
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Personal Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            {...register('fullName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Insurance Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Company *
            </label>
            <input
              {...register('insuranceCompany')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            {errors.insuranceCompany && (
              <p className="text-red-600 text-sm mt-1">{errors.insuranceCompany.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claim Number (if available)
            </label>
            <input
              {...register('claimNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Property Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Property Requirements</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desired Location *
          </label>
          <input
            {...register('desiredLocation')}
            placeholder="City, State"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
          {errors.desiredLocation && (
            <p className="text-red-600 text-sm mt-1">{errors.desiredLocation.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Move-In Date *
            </label>
            <input
              type="date"
              {...register('moveInDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            {errors.moveInDate && (
              <p className="text-red-600 text-sm mt-1">{errors.moveInDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms *
            </label>
            <select
              {...register('numberOfBedrooms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
            {errors.numberOfBedrooms && (
              <p className="text-red-600 text-sm mt-1">{errors.numberOfBedrooms.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupants *
            </label>
            <input
              type="number"
              {...register('numberOfOccupants')}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
            {errors.numberOfOccupants && (
              <p className="text-red-600 text-sm mt-1">{errors.numberOfOccupants.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Do you have pets? *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('pets')}
                value="yes"
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('pets')}
                value="no"
                className="mr-2"
              />
              No
            </label>
          </div>
          {errors.pets && (
            <p className="text-red-600 text-sm mt-1">{errors.pets.message}</p>
          )}
        </div>

        {hasPets === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Details (type, size, breed)
            </label>
            <textarea
              {...register('petDetails')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            {...register('additionalNotes')}
            rows={4}
            placeholder="Any special requirements or additional information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Submitting...</span>
          </>
        ) : (
          'Submit Request'
        )}
      </Button>
    </form>
  )
}
