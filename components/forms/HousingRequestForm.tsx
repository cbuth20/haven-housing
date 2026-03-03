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
  // Service type
  serviceType: z.enum(['Hotel', 'Housing', 'Hotel w/ Housing', 'FRV'], {
    message: 'Please select a service type',
  }),

  // Your Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mainPhone: z.string().min(10, 'Main phone is required'),
  mobilePhone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required'),

  // Claim Information
  policyType: z.enum(['Homeowners', 'Renters', 'Condo'], {
    message: 'Policy type is required',
  }),
  claimNumber: z.string().min(1, 'Claim number is required'),
  aleDollarLimit: z.string().optional(),
  aleTimeLimit: z.string().optional(),
  typeOfLoss: z.enum(['Fire', 'Water', 'Wind', 'Flooding', 'CAT', 'Other'], {
    message: 'Type of loss is required',
  }),
  dateOfLoss: z.string().min(1, 'Date of loss is required'),
  typeOfLossDetails: z.string().optional(),
  familyDynamics: z.string().optional(),

  // Policyholder Information
  phFirstName: z.string().min(1, 'First name is required'),
  phLastName: z.string().min(1, 'Last name is required'),
  phCellPhone: z.string().min(10, 'Cell phone is required'),
  phAlternatePhone: z.string().optional(),
  phEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  phStreetAddress: z.string().min(1, 'Street address is required'),
  phCity: z.string().min(1, 'City is required'),
  phState: z.string().min(1, 'State is required'),
  phZip: z.string().min(5, 'Zip code is required'),

  // Family Members
  numberOfAdults: z.string().min(1, 'Number of adults is required'),
  numberOfKids: z.string().min(1, 'Number of kids is required'),
  hasPets: z.enum(['Yes', 'No'], { message: 'Please select' }),
  numberOfPets: z.string().optional(),
  petDescription: z.string().optional(),

  // Hotel fields (conditional)
  nightsApproved: z.string().optional(),
  roomsApproved: z.string().optional(),
  hotelParkingApproved: z.enum(['Yes', 'No']).optional(),
  numberOfCars: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),

  // Housing fields (conditional)
  monthlyBudget: z.string().optional(),
  leaseLength: z.string().optional(),

  // Notes
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function HousingRequestForm() {
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
      hasPets: undefined,
      hotelParkingApproved: undefined,
    },
  })

  const serviceType = watch('serviceType')
  const hasPets = watch('hasPets')
  const hotelParking = watch('hotelParkingApproved')

  const showHotelFields = serviceType === 'Hotel' || serviceType === 'Hotel w/ Housing'
  const showHousingFields = serviceType === 'Housing' || serviceType === 'Hotel w/ Housing'

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/.netlify/functions/form-submit-housing-request', {
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

      {/* Service Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Service Type</h3>
        <div>
          <label className={labelClass}>Claim Type *</label>
          <select {...register('serviceType')} className={inputClass}>
            <option value="">Select a service...</option>
            <option value="Hotel">Hotel</option>
            <option value="Housing">Housing</option>
            <option value="Hotel w/ Housing">Hotel w/ Housing</option>
            <option value="FRV">FRV</option>
          </select>
          {errors.serviceType && <p className="text-red-600 text-sm mt-1">{errors.serviceType.message}</p>}
        </div>
      </div>

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
            <label className={labelClass}>Company Name *</label>
            <input {...register('companyName')} className={inputClass} />
            {errors.companyName && <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>}
          </div>
        </div>
      </div>

      {/* Claim Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Claim Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Policy Type *</label>
            <select {...register('policyType')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Homeowners">Homeowners</option>
              <option value="Renters">Renters</option>
              <option value="Condo">Condo</option>
            </select>
            {errors.policyType && <p className="text-red-600 text-sm mt-1">{errors.policyType.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Claim Number *</label>
            <input {...register('claimNumber')} className={inputClass} />
            {errors.claimNumber && <p className="text-red-600 text-sm mt-1">{errors.claimNumber.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>A.L.E. Dollar Limit</label>
            <input type="number" {...register('aleDollarLimit')} placeholder="$" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>A.L.E. Time Limit</label>
            <input {...register('aleTimeLimit')} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type of Loss *</label>
            <select {...register('typeOfLoss')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Wind">Wind</option>
              <option value="Flooding">Flooding</option>
              <option value="CAT">CAT</option>
              <option value="Other">Other</option>
            </select>
            {errors.typeOfLoss && <p className="text-red-600 text-sm mt-1">{errors.typeOfLoss.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Date of Loss *</label>
            <input type="date" {...register('dateOfLoss')} className={inputClass} />
            {errors.dateOfLoss && <p className="text-red-600 text-sm mt-1">{errors.dateOfLoss.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Type of Loss Details</label>
          <textarea {...register('typeOfLossDetails')} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Family Dynamics / Special Instructions</label>
          <textarea {...register('familyDynamics')} rows={3} className={inputClass} />
        </div>
      </div>

      {/* Policyholder Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Policyholder Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input {...register('phFirstName')} className={inputClass} />
            {errors.phFirstName && <p className="text-red-600 text-sm mt-1">{errors.phFirstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input {...register('phLastName')} className={inputClass} />
            {errors.phLastName && <p className="text-red-600 text-sm mt-1">{errors.phLastName.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cell Phone *</label>
            <input type="tel" {...register('phCellPhone')} className={inputClass} />
            {errors.phCellPhone && <p className="text-red-600 text-sm mt-1">{errors.phCellPhone.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Alternate Phone</label>
            <input type="tel" {...register('phAlternatePhone')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" {...register('phEmail')} className={inputClass} />
          {errors.phEmail && <p className="text-red-600 text-sm mt-1">{errors.phEmail.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Street Address *</label>
          <input {...register('phStreetAddress')} className={inputClass} />
          {errors.phStreetAddress && <p className="text-red-600 text-sm mt-1">{errors.phStreetAddress.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input {...register('phCity')} className={inputClass} />
            {errors.phCity && <p className="text-red-600 text-sm mt-1">{errors.phCity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <select {...register('phState')} className={inputClass}>
              <option value="">Select...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.phState && <p className="text-red-600 text-sm mt-1">{errors.phState.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Zip Code *</label>
            <input {...register('phZip')} className={inputClass} />
            {errors.phZip && <p className="text-red-600 text-sm mt-1">{errors.phZip.message}</p>}
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Family Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Number of Adults *</label>
            <input type="number" min="1" {...register('numberOfAdults')} className={inputClass} />
            {errors.numberOfAdults && <p className="text-red-600 text-sm mt-1">{errors.numberOfAdults.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Number of Kids *</label>
            <input type="number" min="0" {...register('numberOfKids')} className={inputClass} />
            {errors.numberOfKids && <p className="text-red-600 text-sm mt-1">{errors.numberOfKids.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Pets *</label>
            <select {...register('hasPets')} className={inputClass}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.hasPets && <p className="text-red-600 text-sm mt-1">{errors.hasPets.message}</p>}
          </div>
        </div>
        {hasPets === 'Yes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Number of Pets</label>
              <select {...register('numberOfPets')} className={inputClass}>
                <option value="">Select...</option>
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pet(s) Description</label>
              <input {...register('petDescription')} placeholder="e.g., 2 small dogs, 1 cat" className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {/* Hotel Fields */}
      {showHotelFields && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Hotel Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nights Approved *</label>
              <input type="number" min="1" {...register('nightsApproved')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rooms Approved</label>
              <input type="number" min="1" {...register('roomsApproved')} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hotel Parking Approved</label>
              <select {...register('hotelParkingApproved')} className={inputClass}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {hotelParking === 'Yes' && (
              <div>
                <label className={labelClass}>Number of Cars</label>
                <select {...register('numberOfCars')} className={inputClass}>
                  <option value="">Select...</option>
                  {[1,2,3,4,5].map((n) => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Check-In Date *</label>
              <input type="date" {...register('checkInDate')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-Out Date *</label>
              <input type="date" {...register('checkOutDate')} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Housing Fields */}
      {showHousingFields && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Housing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Monthly Budget</label>
              <input type="number" {...register('monthlyBudget')} placeholder="$" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lease Length *</label>
              <input {...register('leaseLength')} placeholder="e.g., 6 months" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy border-b border-gray-200 pb-2">Additional Information</h3>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea {...register('notes')} rows={4} placeholder="Any additional information or special requirements..." className={inputClass} />
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Submitting...</span>
          </>
        ) : (
          'Submit Housing Request'
        )}
      </Button>
    </form>
  )
}
