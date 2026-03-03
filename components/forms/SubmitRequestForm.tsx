'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const schema = z.object({
  // Your Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mainPhone: z.string().min(10, 'Main phone is required'),
  mobilePhone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  companyOrAgency: z.string().min(1, 'Company/Agency is required'),

  // On behalf of someone else
  onBehalfOfOther: z.enum(['Yes', 'No'], { message: 'Please select' }),
  otherFirstName: z.string().optional(),
  otherLastName: z.string().optional(),
  otherMainPhone: z.string().optional(),
  otherMobilePhone: z.string().optional(),
  otherEmail: z.string().optional(),

  // Preferred Location
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  searchRadius: z.string().min(1, 'Search radius is required'),

  // Request Information
  moveInDate: z.string().min(1, 'Move-in date is required'),
  moveOutDate: z.string().min(1, 'Move-out date is required'),
  needExtension: z.enum(['Yes', 'No'], { message: 'Please select' }),
  numberOfUnits: z.string().min(1, 'Number of units is required'),
  numberOfAdults: z.string().min(1, 'Number of adults is required'),
  numberOfKids: z.string().optional(),
  numberOfBedrooms: z.string().min(1, 'Number of bedrooms is required'),
  numberOfBathrooms: z.string().min(1, 'Number of bathrooms is required'),
  hasPets: z.enum(['Yes', 'No'], { message: 'Please select' }),
  petDescription: z.string().optional(),
  nightlyBudget: z.string().min(1, 'Nightly budget is required'),
  parking: z.string().min(1, 'Parking info is required'),
  housekeeping: z.enum(['Yes', 'No'], { message: 'Please select' }),
  specialRequests: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function SubmitRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'United States',
    },
  })

  const onBehalfOfOther = watch('onBehalfOfOther')
  const hasPets = watch('hasPets')

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/.netlify/functions/form-submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit request')

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
          Request Submitted!
        </h3>
        <p className="text-green-800 mb-4">
          Thank you for your submission. Our team will review your request and contact you shortly.
        </p>
        <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
          Submit Another Request
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

      {/* Your Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input {...register('firstName')} className={inputClass} />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input {...register('lastName')} className={inputClass} />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Main Phone *</label>
            <input type="tel" {...register('mainPhone')} className={inputClass} />
            {errors.mainPhone && <p className="text-red-600 text-sm mt-1">{errors.mainPhone.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Mobile Phone</label>
            <input type="tel" {...register('mobilePhone')} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email Address *</label>
            <input type="email" {...register('email')} className={inputClass} />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Company / Government Agency *</label>
            <input {...register('companyOrAgency')} className={inputClass} />
            {errors.companyOrAgency && <p className="text-red-600 text-sm mt-1">{errors.companyOrAgency.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Is this request on behalf of someone else? *</label>
          <select {...register('onBehalfOfOther')} className={inputClass}>
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.onBehalfOfOther && <p className="text-red-600 text-sm mt-1">{errors.onBehalfOfOther.message}</p>}
        </div>

        {onBehalfOfOther === 'Yes' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <p className="text-sm font-medium text-gray-600">Guest / Occupant Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input {...register('otherFirstName')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input {...register('otherLastName')} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Main Phone *</label>
                <input type="tel" {...register('otherMainPhone')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mobile Phone</label>
                <input type="tel" {...register('otherMobilePhone')} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" {...register('otherEmail')} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {/* Preferred Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Preferred Location</h3>
        <div>
          <label className={labelClass}>Street Address *</label>
          <input {...register('streetAddress')} className={inputClass} />
          {errors.streetAddress && <p className="text-red-600 text-sm mt-1">{errors.streetAddress.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input {...register('city')} className={inputClass} />
            {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <select {...register('state')} className={inputClass}>
              <option value="">Select...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Zip Code *</label>
            <input {...register('zip')} className={inputClass} />
            {errors.zip && <p className="text-red-600 text-sm mt-1">{errors.zip.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Country *</label>
            <input {...register('country')} className={inputClass} />
            {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Search Radius *</label>
            <input {...register('searchRadius')} placeholder="Miles from preferred location" className={inputClass} />
            {errors.searchRadius && <p className="text-red-600 text-sm mt-1">{errors.searchRadius.message}</p>}
          </div>
        </div>
      </div>

      {/* Request Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Request Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Move-In Date *</label>
            <input type="date" {...register('moveInDate')} className={inputClass} />
            {errors.moveInDate && <p className="text-red-600 text-sm mt-1">{errors.moveInDate.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Move-Out Date *</label>
            <input type="date" {...register('moveOutDate')} className={inputClass} />
            {errors.moveOutDate && <p className="text-red-600 text-sm mt-1">{errors.moveOutDate.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Do you need the ability to extend? *</label>
            <select {...register('needExtension')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.needExtension && <p className="text-red-600 text-sm mt-1">{errors.needExtension.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Number of Units *</label>
            <input type="number" min="1" {...register('numberOfUnits')} className={inputClass} />
            {errors.numberOfUnits && <p className="text-red-600 text-sm mt-1">{errors.numberOfUnits.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Number of Adults *</label>
            <input type="number" min="1" {...register('numberOfAdults')} className={inputClass} />
            {errors.numberOfAdults && <p className="text-red-600 text-sm mt-1">{errors.numberOfAdults.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Number of Kids (with ages)</label>
            <input {...register('numberOfKids')} placeholder="e.g., 2 (ages 5, 8)" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Number of Bedrooms *</label>
            <input type="number" min="0" {...register('numberOfBedrooms')} className={inputClass} />
            {errors.numberOfBedrooms && <p className="text-red-600 text-sm mt-1">{errors.numberOfBedrooms.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Number of Bathrooms *</label>
            <input type="number" min="1" step="0.5" {...register('numberOfBathrooms')} className={inputClass} />
            {errors.numberOfBathrooms && <p className="text-red-600 text-sm mt-1">{errors.numberOfBathrooms.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pets *</label>
            <select {...register('hasPets')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.hasPets && <p className="text-red-600 text-sm mt-1">{errors.hasPets.message}</p>}
          </div>
          {hasPets === 'Yes' && (
            <div>
              <label className={labelClass}>Pet(s) Description</label>
              <input {...register('petDescription')} placeholder="e.g., 1 small dog" className={inputClass} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Nightly Budget *</label>
            <input type="number" {...register('nightlyBudget')} placeholder="$" className={inputClass} />
            {errors.nightlyBudget && <p className="text-red-600 text-sm mt-1">{errors.nightlyBudget.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Parking *</label>
            <input {...register('parking')} placeholder="Number of spaces" className={inputClass} />
            {errors.parking && <p className="text-red-600 text-sm mt-1">{errors.parking.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Housekeeping *</label>
            <select {...register('housekeeping')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.housekeeping && <p className="text-red-600 text-sm mt-1">{errors.housekeeping.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Special Requests</label>
          <textarea {...register('specialRequests')} rows={4} placeholder="1st Floor, Access and Functional Needs, Pool, etc..." className={inputClass} />
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
