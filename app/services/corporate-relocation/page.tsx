import { CorporateRelocationForm } from '@/components/forms/CorporateRelocationForm'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function CorporateRelocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Corporate Relocation Services
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Streamline your employee relocations with our comprehensive corporate housing solutions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-heading font-bold text-navy mb-6">
              Corporate Housing Solutions
            </h2>
            <p className="text-gray-700 mb-6">
              Support your team's success with quality temporary housing. We provide turnkey solutions for relocating employees, from short-term assignments to extended projects.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible Terms</h3>
                  <p className="text-gray-600">Month-to-month or extended stay options</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Corporate Billing</h3>
                  <p className="text-gray-600">Simplified invoicing and payment processing</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Quality Properties</h3>
                  <p className="text-gray-600">Professional accommodations for your team</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dedicated Account Manager</h3>
                  <p className="text-gray-600">Single point of contact for all your needs</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-2">Volume Discounts Available</h3>
              <p className="text-orange-800">
                Contact us to learn about special rates for multiple employees or extended engagements.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-heading font-bold text-navy mb-6">
              Request Corporate Housing
            </h2>
            <CorporateRelocationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
