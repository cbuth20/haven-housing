import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { BuildingLibraryIcon, DocumentArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Government & Military Housing | Haven Housing Solutions',
  description: 'Trusted housing solutions for government and military personnel on temporary or extended assignments throughout the United States.',
}

export default function GovernmentPage() {
  const naicsCodes = [
    { code: '531110', description: 'Lessors of Residential Buildings and Dwellings' },
    { code: '531190', description: 'Lessors of Other Real Estate Property' },
    { code: '561599', description: 'Other Travel Arrangement Reservation Services' },
    { code: '624230', description: 'Emergency & Other Relief Services' },
    { code: '624221', description: 'Temporary Shelters' },
    { code: '721110', description: 'Hotels and Motels (except casino hotels)' },
    { code: '721119', description: 'All Other Traveler Accommodations' },
  ]

  const pscCodes = [
    { code: 'V231', description: 'Transportation/Travel/Relocation - Travel/Lodging/Recruitment: Lodging, Hotel/Motel' },
    { code: 'X1FA', description: 'Lease/Rental of Family Housing Facilities' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <BuildingLibraryIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Government & Military Housing
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Trusted Government & Military Service Provider
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We provide housing for government and military personnel on temporary or extended assignments throughout the United States by helping find solutions to our clients unique housing needs while remaining cost effective and efficient. As a certified small business, our dedicated team will find a solution that meets your project's needs and budget.
            </p>

            {/* Certifications */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">
                Certifications
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">UEI</p>
                  <p className="text-lg font-mono text-navy">HUHKMBJVN178</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">CAGE/NCAGE</p>
                  <p className="text-lg font-mono text-navy">9WGC7</p>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="primary" className="inline-flex items-center gap-2">
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Download Capabilities Statement
                </Button>
              </div>
            </div>

            {/* NAICS Codes */}
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">
                NAICS Codes
              </h2>
              <div className="space-y-3">
                {naicsCodes.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-navy">{item.code}</p>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PSC Codes */}
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">
                PSC Codes
              </h2>
              <div className="space-y-3">
                {pscCodes.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-navy">{item.code}</p>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Contact us today to discuss your government housing needs
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
