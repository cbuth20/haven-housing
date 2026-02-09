import Link from 'next/link'
import { Button } from '@/components/common/Button'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Welcome to Haven Housing Solutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Your trusted partner in property management and relocation services for
              insurance, corporate, and government clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties">
                <Button variant="secondary" size="lg">
                  Search Properties
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized relocation and housing solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Insurance Relocation */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-heading font-bold text-navy mb-3">
                Insurance Relocation
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive housing solutions for insurance claim relocation needs
                with 24/7 support and rapid placement.
              </p>
              <Link
                href="/services/insurance-relocation"
                className="text-orange hover:text-orange-600 font-medium"
              >
                Learn more →
              </Link>
            </div>

            {/* Corporate Relocation */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-heading font-bold text-navy mb-3">
                Corporate Relocation
              </h3>
              <p className="text-gray-600 mb-4">
                Seamless employee relocation services for businesses of all sizes
                with dedicated account management.
              </p>
              <Link
                href="/services/corporate-relocation"
                className="text-orange hover:text-orange-600 font-medium"
              >
                Learn more →
              </Link>
            </div>

            {/* Government Lodging */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-heading font-bold text-navy mb-3">
                Government Lodging
              </h3>
              <p className="text-gray-600 mb-4">
                Compliant housing solutions for government agencies and contractors
                with full documentation support.
              </p>
              <Link
                href="/services/government-lodging"
                className="text-orange hover:text-orange-600 font-medium"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Have a Property to List?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Submit your property to our network and connect with qualified tenants
            from our insurance, corporate, and government partners.
          </p>
          <Link href="/submit-property">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange">
              Submit a Property
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-heading font-bold text-navy mb-2">500+</div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-navy mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-navy mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-navy mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
