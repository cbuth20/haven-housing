import { z } from 'zod'

// Property validation schema
export const PropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country: z.string().default('USA'),
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
  other_amenities: z.array(z.string()).nullable().optional(),
  landlord_name: z.string().nullable().optional(),
  landlord_email: z.string().email().nullable().optional(),
  landlord_phone: z.string().nullable().optional(),
  monthly_rent: z.number().positive().nullable().optional(),
  cover_photo_url: z.string().url().nullable().optional(),
  media_gallery_urls: z.array(z.string().url()).nullable().optional(),
  listing_link: z.string().url().nullable().optional(),
  property_level: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

// Property submission schema
export const PropertySubmissionSchema = z.object({
  submitter_name: z.string().min(1),
  submitter_email: z.string().email(),
  submitter_phone: z.string().nullable().optional(),
  submission_data: z.record(z.string(), z.any()),
})

// Form submission schemas
export const InsuranceFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  claimNumber: z.string().optional(),
  insuranceCompany: z.string().optional(),
  preferredLocation: z.string().optional(),
  moveInDate: z.string().optional(),
  numberOfOccupants: z.number().optional(),
  pets: z.boolean().optional(),
  petDetails: z.string().optional(),
  additionalNotes: z.string().optional(),
})

export const CorporateFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().min(1, 'Company is required'),
  employeeId: z.string().optional(),
  relocationCity: z.string().min(1, 'City is required'),
  relocationState: z.string().min(1, 'State is required'),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  numberOfOccupants: z.number().optional(),
  bedrooms: z.number().optional(),
  budget: z.number().optional(),
  additionalRequirements: z.string().optional(),
})

export const GovernmentFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  agency: z.string().min(1, 'Agency is required'),
  contractNumber: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  numberOfRooms: z.number().optional(),
  numberOfOccupants: z.number().optional(),
  specialRequirements: z.string().optional(),
})

export const ContactFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})
