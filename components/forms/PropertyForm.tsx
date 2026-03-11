'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Property } from '@/types/property'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { Button } from '@/components/common/Button'
import { FileUpload } from '@/components/common/FileUpload'
import { useProperties } from '@/hooks/useProperties'

const baseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country: z.string(),
  description: z.string().nullable().optional(),
  square_footage: z.number().int().positive().nullable().optional(),
  unit_type: z.string().nullable().optional(),
  beds: z.number().int().min(0).nullable().optional(),
  baths: z.number().min(0).nullable().optional(),
  laundry: z.string().nullable().optional(),
  pet_policy: z.string().nullable().optional(),
  parking: z.string().nullable().optional(),
  furnish_level: z.string().nullable().optional(),
  landlord_name: z.string().nullable().optional(),
  landlord_email: z.string().email().or(z.literal('')).nullable().optional(),
  landlord_phone: z.string().nullable().optional(),
  monthly_rent: z.number().positive().nullable().optional(),
  listing_link: z.string().url().or(z.literal('')).nullable().optional(),
  property_level: z.string().nullable().optional(),
})

const adminSchema = baseSchema.extend({
  featured: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
})

const submissionSchema = baseSchema.extend({
  submitter_name: z.string().min(2, 'Name is required'),
  submitter_email: z.string().email('Invalid email'),
  submitter_phone: z.string().min(10, 'Phone is required'),
})

type AdminFormData = z.infer<typeof adminSchema>
type SubmissionFormData = z.infer<typeof submissionSchema>
type PropertyFormData = AdminFormData | SubmissionFormData

interface AdminFormProps {
  mode?: 'admin'
  property?: Property
  onSuccess: () => void
  onCancel: () => void
}

interface SubmissionFormProps {
  mode: 'submission'
  property?: never
  onSuccess?: () => void
  onCancel?: () => void
}

type PropertyFormProps = AdminFormProps | SubmissionFormProps

export function PropertyForm(props: PropertyFormProps) {
  const { mode = 'admin' } = props
  const property = mode === 'admin' ? (props as AdminFormProps).property : undefined
  const onSuccess = props.onSuccess
  const onCancel = mode === 'admin' ? (props as AdminFormProps).onCancel : undefined

  const { createProperty, updateProperty, uploadPhotos, isLoading } = useProperties()
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    property?.media_gallery_urls || []
  )
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(
    property?.cover_photo_url || null
  )
  const [isUploading, setIsUploading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = mode === 'admin' ? adminSchema : submissionSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: property || {
      ...(mode === 'admin' ? { status: 'draft', featured: false } : {}),
      country: 'USA',
    },
  })

  const onSubmit = async (data: any) => {
    try {
      setIsUploading(true)
      setSubmitError(null)

      if (mode === 'submission') {
        // Submit as a property submission for review
        const submissionData = {
          submitterName: data.submitter_name,
          submitterEmail: data.submitter_email,
          submitterPhone: data.submitter_phone,
          title: data.title,
          streetAddress: data.street_address,
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          description: data.description || '',
          monthlyRent: data.monthly_rent ? String(data.monthly_rent) : '',
          beds: data.beds ? String(data.beds) : '',
          baths: data.baths ? String(data.baths) : '',
          squareFootage: data.square_footage ? String(data.square_footage) : '',
          petPolicy: data.pet_policy || '',
          parking: data.parking || '',
          laundry: data.laundry || '',
          furnishLevel: data.furnish_level || '',
          listingLink: data.listing_link || '',
          landlordName: data.landlord_name || '',
          landlordEmail: data.landlord_email || '',
          landlordPhone: data.landlord_phone || '',
        }

        const response = await fetch('/.netlify/functions/property-submission-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        })

        if (!response.ok) throw new Error('Failed to submit property')

        setSubmitSuccess(true)
        reset()
        return
      }

      // Admin mode: direct database operation
      let uploadedUrls: string[] = []
      if (photos.length > 0) {
        uploadedUrls = await uploadPhotos(photos)
      }

      const allPhotoUrls = [...existingPhotos, ...uploadedUrls]
      const finalCoverPhoto = coverPhotoUrl || allPhotoUrls[0] || null

      const propertyData = {
        ...data,
        beds: data.beds ? Number(data.beds) : null,
        baths: data.baths ? Number(data.baths) : null,
        square_footage: data.square_footage ? Number(data.square_footage) : null,
        monthly_rent: data.monthly_rent ? Number(data.monthly_rent) : null,
        cover_photo_url: finalCoverPhoto,
        media_gallery_urls: allPhotoUrls,
      }

      if (property) {
        await updateProperty(property.id, propertyData)
      } else {
        await createProperty(propertyData)
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving property:', error)
      setSubmitError(error.message || 'Failed to save property')
    } finally {
      setIsUploading(false)
    }
  }

  const stateOptions = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ]

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]

  const petPolicyOptions = [
    { value: '', label: 'Select Pet Policy' },
    { value: 'No Pets', label: 'No Pets' },
    { value: 'Cats Allowed', label: 'Cats Allowed' },
    { value: 'Dogs Allowed', label: 'Dogs Allowed' },
    { value: 'Cats and Dogs Allowed', label: 'Cats and Dogs Allowed' },
    { value: 'Negotiable', label: 'Negotiable' },
  ]

  const laundryOptions = [
    { value: '', label: 'Select Laundry' },
    { value: 'In-Unit', label: 'In-Unit' },
    { value: 'Shared', label: 'Shared' },
    { value: 'None', label: 'None' },
    { value: 'Hookups', label: 'Hookups Available' },
  ]

  const parkingOptions = [
    { value: '', label: 'Select Parking' },
    { value: 'Garage', label: 'Garage' },
    { value: 'Driveway', label: 'Driveway' },
    { value: 'Street', label: 'Street Parking' },
    { value: 'None', label: 'No Parking' },
    { value: 'Covered', label: 'Covered' },
  ]

  const furnishOptions = [
    { value: '', label: 'Select Furnish Level' },
    { value: 'Unfurnished', label: 'Unfurnished' },
    { value: 'Partially Furnished', label: 'Partially Furnished' },
    { value: 'Fully Furnished', label: 'Fully Furnished' },
  ]

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}

      {/* Submitter Information (submission mode only) */}
      {mode === 'submission' && (
        <div>
          <h3 className="text-lg font-semibold text-navy mb-4">Your Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Your Name"
              {...register('submitter_name')}
              error={errors.submitter_name?.message as string}
              required
            />
            <Input
              label="Your Email"
              type="email"
              {...register('submitter_email')}
              error={errors.submitter_email?.message as string}
              required
            />
            <Input
              label="Your Phone"
              type="tel"
              {...register('submitter_phone')}
              error={errors.submitter_phone?.message as string}
              required
            />
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Property Title"
              {...register('title')}
              error={errors.title?.message as string}
              required
              placeholder="Beautiful 2BR Apartment in Downtown"
            />
          </div>

          <Input
            label="Street Address"
            {...register('street_address')}
            error={errors.street_address?.message as string}
            required
            placeholder="123 Main St, Apt 4B"
          />

          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message as string}
            required
            placeholder="Austin"
          />

          <Select
            label="State"
            {...register('state')}
            error={errors.state?.message as string}
            options={stateOptions}
            required
          />

          <Input
            label="Zip Code"
            {...register('zip_code')}
            error={errors.zip_code?.message as string}
            required
            placeholder="78701"
          />

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              {...register('description')}
              error={errors.description?.message as string}
              placeholder="Describe the property..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Bedrooms"
            type="number"
            {...register('beds', { valueAsNumber: true })}
            error={errors.beds?.message as string}
            min="0"
            placeholder="2"
          />

          <Input
            label="Bathrooms"
            type="number"
            step="0.5"
            {...register('baths', { valueAsNumber: true })}
            error={errors.baths?.message as string}
            min="0"
            placeholder="2"
          />

          <Input
            label="Square Footage"
            type="number"
            {...register('square_footage', { valueAsNumber: true })}
            error={errors.square_footage?.message as string}
            min="0"
            placeholder="1200"
          />

          <Input
            label="Unit Type"
            {...register('unit_type')}
            error={errors.unit_type?.message as string}
            placeholder="Apartment, House, Condo"
          />

          <Input
            label="Monthly Rent"
            type="number"
            step="0.01"
            {...register('monthly_rent', { valueAsNumber: true })}
            error={errors.monthly_rent?.message as string}
            min="0"
            placeholder="2500"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Pet Policy"
            {...register('pet_policy')}
            error={errors.pet_policy?.message as string}
            options={petPolicyOptions}
          />

          <Select
            label="Laundry"
            {...register('laundry')}
            error={errors.laundry?.message as string}
            options={laundryOptions}
          />

          <Select
            label="Parking"
            {...register('parking')}
            error={errors.parking?.message as string}
            options={parkingOptions}
          />

          <Select
            label="Furnish Level"
            {...register('furnish_level')}
            error={errors.furnish_level?.message as string}
            options={furnishOptions}
          />
        </div>
      </div>

      {/* Landlord Information */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Landlord Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Landlord Name"
            {...register('landlord_name')}
            error={errors.landlord_name?.message as string}
            placeholder="John Doe"
          />

          <Input
            label="Landlord Email"
            type="email"
            {...register('landlord_email')}
            error={errors.landlord_email?.message as string}
            placeholder="landlord@example.com"
          />

          <Input
            label="Landlord Phone"
            type="tel"
            {...register('landlord_phone')}
            error={errors.landlord_phone?.message as string}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Listing Link */}
      <div>
        <Input
          label="Listing Link (Optional)"
          type="url"
          {...register('listing_link')}
          error={errors.listing_link?.message as string}
          placeholder="https://..."
        />
      </div>

      {/* Photos */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Photos</h3>
        <FileUpload
          onFilesSelected={setPhotos}
          existingUrls={existingPhotos}
          onRemoveExisting={(url) => {
            setExistingPhotos(existingPhotos.filter((u) => u !== url))
          }}
          maxFiles={10}
        />
      </div>

      {/* Admin-only: Status & Featured */}
      {mode === 'admin' && (
        <div>
          <h3 className="text-lg font-semibold text-navy mb-4">Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              {...register('status')}
              error={(errors as any).status?.message}
              options={statusOptions}
              required
            />

            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Featured Property
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className={`flex ${mode === 'admin' ? 'justify-end' : 'justify-center'} gap-3 pt-6 border-t`}>
        {mode === 'admin' && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className={mode === 'submission' ? 'w-full' : ''}
          isLoading={isLoading || isUploading}
        >
          {mode === 'admin'
            ? property ? 'Update Property' : 'Create Property'
            : 'Submit Property for Review'
          }
        </Button>
      </div>
    </form>
  )
}
