import { SubmitRequestForm } from '@/components/forms/SubmitRequestForm'

export default function SubmitRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Submit a Request
          </h1>
          <p className="text-xl text-gray-200">
            Request temporary housing for corporate and government needs.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-blue-800">
              <p>Fields marked with * are required.</p>
              <p>Our team will review your request and respond as quickly as possible.</p>
              <p>For urgent requests, please call us at <a href="tel:1-844-454-2836" className="font-semibold underline">1-844-454-2836</a>.</p>
            </div>
          </div>

          <SubmitRequestForm />
        </div>
      </div>
    </div>
  )
}
