'use client'

import { useEffect, useState } from 'react'
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

const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
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
  landlord_email: z.string().email().nullable().optional(),
  landlord_phone: z.string().nullable().optional(),
  monthly_rent: z.number().positive().nullable().optional(),
  listing_link: z.string().url().nullable().optional(),
  property_level: z.string().nullable().optional(),
  featured: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
})

type PropertyFormData = z.infer<typeof propertyFormSchema>

interface PropertyFormProps {
  property?: Property
  onSuccess: () => void
  onCancel: () => void
}

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const { createProperty, updateProperty, uploadPhotos, isLoading } = useProperties()
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    property?.media_gallery_urls || []
  )
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(
    property?.cover_photo_url || null
  )
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property || {
      status: 'draft',
      featured: false,
      country: 'USA',
    },
  })

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsUploading(true)

      // Upload new photos if any
      let uploadedUrls: string[] = []
      if (photos.length > 0) {
        uploadedUrls = await uploadPhotos(photos)
      }

      // Combine existing and new photos
      const allPhotoUrls = [...existingPhotos, ...uploadedUrls]

      // Set cover photo (first photo if not set)
      const finalCoverPhoto = coverPhotoUrl || allPhotoUrls[0] || null

      const propertyData = {
        ...data,
        beds: data.beds ? Number(data.beds) : null,
        baths: data.baths ? Number(data.baths) : null,
        square_footage: data.square_footage ? Number(data.square_footage) : null,
        monthly_rent: data.monthly_rent ? Number(data.monthly_rent) : null,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        cover_photo_url: finalCoverPhoto,
        media_gallery_urls: allPhotoUrls,
      }

      if (property) {
        await updateProperty(property.id, propertyData)
      } else {
        await createProperty(propertyData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving property:', error)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Property Title"
              {...register('title')}
              error={errors.title?.message}
              required
              placeholder="Beautiful 2BR Apartment in Downtown"
            />
          </div>

          <Input
            label="Street Address"
            {...register('street_address')}
            error={errors.street_address?.message}
            required
            placeholder="123 Main St, Apt 4B"
          />

          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message}
            required
            placeholder="Austin"
          />

          <Select
            label="State"
            {...register('state')}
            error={errors.state?.message}
            options={stateOptions}
            required
          />

          <Input
            label="Zip Code"
            {...register('zip_code')}
            error={errors.zip_code?.message}
            required
            placeholder="78701"
          />

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              {...register('description')}
              error={errors.description?.message}
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
            error={errors.beds?.message}
            min="0"
            placeholder="2"
          />

          <Input
            label="Bathrooms"
            type="number"
            step="0.5"
            {...register('baths', { valueAsNumber: true })}
            error={errors.baths?.message}
            min="0"
            placeholder="2"
          />

          <Input
            label="Square Footage"
            type="number"
            {...register('square_footage', { valueAsNumber: true })}
            error={errors.square_footage?.message}
            min="0"
            placeholder="1200"
          />

          <Input
            label="Unit Type"
            {...register('unit_type')}
            error={errors.unit_type?.message}
            placeholder="Apartment, House, Condo"
          />

          <Input
            label="Monthly Rent"
            type="number"
            step="0.01"
            {...register('monthly_rent', { valueAsNumber: true })}
            error={errors.monthly_rent?.message}
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
            error={errors.pet_policy?.message}
            options={petPolicyOptions}
          />

          <Select
            label="Laundry"
            {...register('laundry')}
            error={errors.laundry?.message}
            options={laundryOptions}
          />

          <Select
            label="Parking"
            {...register('parking')}
            error={errors.parking?.message}
            options={parkingOptions}
          />

          <Select
            label="Furnish Level"
            {...register('furnish_level')}
            error={errors.furnish_level?.message}
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
            error={errors.landlord_name?.message}
            placeholder="John Doe"
          />

          <Input
            label="Landlord Email"
            type="email"
            {...register('landlord_email')}
            error={errors.landlord_email?.message}
            placeholder="landlord@example.com"
          />

          <Input
            label="Landlord Phone"
            type="tel"
            {...register('landlord_phone')}
            error={errors.landlord_phone?.message}
            placeholder="(555) 123-4567"
          />
        </div>
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

      {/* Additional Settings */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            {...register('status')}
            error={errors.status?.message}
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

          <Input
            label="Listing Link (Optional)"
            type="url"
            {...register('listing_link')}
            error={errors.listing_link?.message}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Geolocation */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">
          Geolocation (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            {...register('latitude', { valueAsNumber: true })}
            error={errors.latitude?.message}
            placeholder="30.2672"
          />

          <Input
            label="Longitude"
            type="number"
            step="any"
            {...register('longitude', { valueAsNumber: true })}
            error={errors.longitude?.message}
            placeholder="-97.7431"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          You can use <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">latlong.net</a> to find coordinates
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading || isUploading}
        >
          {property ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  )
}
