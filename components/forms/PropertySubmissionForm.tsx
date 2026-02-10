'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const schema = z.object({
  // Submitter info
  submitterName: z.string().min(2, 'Name is required'),
  submitterEmail: z.string().email('Invalid email'),
  submitterPhone: z.string().min(10, 'Phone is required'),

  // Property info
  title: z.string().min(5, 'Title is required'),
  streetAddress: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),

  description: z.string().min(20, 'Description must be at least 20 characters'),
  monthlyRent: z.string().min(1, 'Rent is required'),
  beds: z.string().min(1, 'Bedrooms required'),
  baths: z.string().min(1, 'Bathrooms required'),
  squareFootage: z.string().optional(),

  // Landlord info
  landlordName: z.string().min(2, 'Landlord name is required'),
  landlordEmail: z.string().email('Invalid email'),
  landlordPhone: z.string().min(10, 'Phone is required'),

  petPolicy: z.string().min(1, 'Pet policy required'),
  parking: z.string().optional(),
  laundry: z.string().optional(),
  furnishLevel: z.string().optional(),
  listingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function PropertySubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/.netlify/functions/property-submission-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit property')

      setSubmitSuccess(true)
      reset()
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-heading font-bold text-green-900 mb-2">
          Property Submitted!
        </h3>
        <p className="text-green-800 mb-4">
          Thank you for submitting your property. Our team will review it and contact you within 48 hours.
        </p>
        <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
          Submit Another Property
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}

      {/* Submitter Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Your Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input {...register('submitterName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.submitterName && <p className="text-red-600 text-sm mt-1">{errors.submitterName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
            <input type="email" {...register('submitterEmail')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.submitterEmail && <p className="text-red-600 text-sm mt-1">{errors.submitterEmail.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
            <input type="tel" {...register('submitterPhone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.submitterPhone && <p className="text-red-600 text-sm mt-1">{errors.submitterPhone.message}</p>}
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Property Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
          <input {...register('title')} placeholder="e.g., Beautiful 3BR Home in Downtown" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
          <input {...register('streetAddress')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          {errors.streetAddress && <p className="text-red-600 text-sm mt-1">{errors.streetAddress.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('city')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input {...register('state')} maxLength={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
            <input {...register('zipCode')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea {...register('description')} rows={4} placeholder="Describe the property, amenities, neighborhood..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
            <input type="number" {...register('monthlyRent')} placeholder="2500" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.monthlyRent && <p className="text-red-600 text-sm mt-1">{errors.monthlyRent.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
            <input type="number" {...register('beds')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.beds && <p className="text-red-600 text-sm mt-1">{errors.beds.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
            <input type="number" step="0.5" {...register('baths')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.baths && <p className="text-red-600 text-sm mt-1">{errors.baths.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
            <input type="number" {...register('squareFootage')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Policy *</label>
            <select {...register('petPolicy')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy">
              <option value="">Select</option>
              <option value="Pets Allowed">Pets Allowed</option>
              <option value="No Pets">No Pets</option>
              <option value="Cats Only">Cats Only</option>
              <option value="Dogs Only">Dogs Only</option>
            </select>
            {errors.petPolicy && <p className="text-red-600 text-sm mt-1">{errors.petPolicy.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Furnish Level</label>
            <select {...register('furnishLevel')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy">
              <option value="">Select</option>
              <option value="Furnished">Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
              <option value="Partial">Partially Furnished</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing Link</label>
          <input type="url" {...register('listingLink')} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          {errors.listingLink && <p className="text-red-600 text-sm mt-1">{errors.listingLink.message}</p>}
        </div>
      </div>

      {/* Landlord Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy">Landlord/Property Manager Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('landlordName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.landlordName && <p className="text-red-600 text-sm mt-1">{errors.landlordName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" {...register('landlordEmail')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.landlordEmail && <p className="text-red-600 text-sm mt-1">{errors.landlordEmail.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" {...register('landlordPhone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
            {errors.landlordPhone && <p className="text-red-600 text-sm mt-1">{errors.landlordPhone.message}</p>}
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Submitting...</span>
          </>
        ) : (
          'Submit Property for Review'
        )}
      </Button>
    </form>
  )
}
