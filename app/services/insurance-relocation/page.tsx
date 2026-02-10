import { InsuranceRelocationForm } from '@/components/forms/InsuranceRelocationForm'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function InsuranceRelocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Insurance Relocation Services
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            We work directly with insurance companies to provide temporary housing solutions for displaced policyholders.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Information */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-navy mb-6">
              How We Help
            </h2>
            <p className="text-gray-700 mb-6">
              Experiencing property damage can be stressful. Haven Housing Solutions partners with insurance companies to provide comfortable, fully-furnished temporary housing while your home is being repaired or rebuilt.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Direct Insurance Billing</h3>
                  <p className="text-gray-600">We work directly with your insurance company for seamless billing</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Fully Furnished Properties</h3>
                  <p className="text-gray-600">Move in ready with all essentials included</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible Duration</h3>
                  <p className="text-gray-600">Stay as long as you need during repairs</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Pet-Friendly Options</h3>
                  <p className="text-gray-600">We understand pets are family too</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                  <p className="text-gray-600">Our team is here to help whenever you need</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Immediate Assistance?</h3>
              <p className="text-blue-800 mb-4">Call us 24/7 for emergency housing placement</p>
              <a href="tel:1-800-HAVEN-HS" className="text-blue-600 font-semibold text-lg">
                1-800-HAVEN-HS
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-heading font-bold text-navy mb-6">
              Request Accommodations
            </h2>
            <InsuranceRelocationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
