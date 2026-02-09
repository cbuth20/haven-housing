export type FormType =
  | 'insurance_relocation'
  | 'corporate_relocation'
  | 'government_lodging'
  | 'contact'
  | 'property_submission'

export interface FormSubmission {
  id: string
  form_type: FormType
  form_data: Record<string, any>
  submitter_email: string | null
  submitter_ip: string | null
  salesforce_id: string | null
  salesforce_synced: boolean
  last_sync_attempt_at: string | null
  sync_error: string | null
  created_at: string
}

export interface InsuranceRelocationFormData {
  fullName: string
  email: string
  phone: string
  claimNumber?: string
  insuranceCompany?: string
  preferredLocation?: string
  moveInDate?: string
  numberOfOccupants?: number
  pets?: boolean
  petDetails?: string
  additionalNotes?: string
}

export interface CorporateRelocationFormData {
  fullName: string
  email: string
  phone: string
  company: string
  employeeId?: string
  relocationCity: string
  relocationState: string
  startDate?: string
  duration?: string
  numberOfOccupants?: number
  bedrooms?: number
  budget?: number
  additionalRequirements?: string
}

export interface GovernmentLodgingFormData {
  fullName: string
  email: string
  phone: string
  agency: string
  contractNumber?: string
  location: string
  checkInDate?: string
  checkOutDate?: string
  numberOfRooms?: number
  numberOfOccupants?: number
  specialRequirements?: string
}

export interface ContactFormData {
  fullName: string
  email: string
  phone?: string
  subject: string
  message: string
}
