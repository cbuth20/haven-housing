import { Metadata } from 'next'
import Link from 'next/link'
import { BuildingLibraryIcon, ShieldCheckIcon, BriefcaseIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Our Services | Haven Housing Solutions',
  description: 'Comprehensive housing solutions for government, insurance placements, and corporate relocations.',
}

export default function ServicesPage() {
  const services = [
    {
      icon: BuildingLibraryIcon,
      title: 'Government & Military',
      description: 'Trusted housing solutions for government and military personnel on temporary or extended assignments throughout the United States.',
      href: '/services/government',
      color: 'from-blue-600 to-blue-700',
      features: [
        'Certified small business',
        'Cost-effective solutions',
        'Extensive network nationwide',
        'UEI: HUHKMBJVN178',
      ],
    },
    {
      icon: ShieldCheckIcon,
      title: 'Insurance Placements',
      description: 'Tailored temporary housing solutions for policyholders facing displacement, creating seamless relocation experiences.',
      href: '/services/insurance',
      color: 'from-green-600 to-green-700',
      features: [
        'Furnished & unfurnished options',
        'Flexible lease terms',
        'Personalized support',
        'Quick property selection',
      ],
    },
    {
      icon: BriefcaseIcon,
      title: 'Corporate Relocation',
      description: 'Seamless, reliable, and fully supported accommodation solutions for employees on assignments, projects, and relocations.',
      href: '/services/corporate',
      color: 'from-purple-600 to-purple-700',
      features: [
        'Turnkey furnished homes',
        'Dedicated support team',
        'Flexible terms',
        'Fast turnarounds',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Comprehensive housing solutions tailored to your unique needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Icon Header */}
              <div className={`bg-gradient-to-r ${service.color} p-8 text-white`}>
                <service.icon className="h-16 w-16 mb-4" />
                <h2 className="text-2xl font-heading font-bold">
                  {service.title}
                </h2>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <ArrowRightIcon className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-orange font-semibold group-hover:gap-3 transition-all">
                  <span>Learn More</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-navy mb-4">
              Why Choose Haven Housing Solutions?
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              We bring expertise, reliability, and personalized service to every housing solution
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                15+
              </div>
              <h3 className="font-semibold text-navy mb-2">Years Experience</h3>
              <p className="text-gray-600 text-sm">Trusted by government, insurance, and corporate clients</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                24/7
              </div>
              <h3 className="font-semibold text-navy mb-2">Support Available</h3>
              <p className="text-gray-600 text-sm">Dedicated team ready to assist you anytime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                100%
              </div>
              <h3 className="font-semibold text-navy mb-2">Client Satisfaction</h3>
              <p className="text-gray-600 text-sm">Committed to exceptional service and results</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                50+
              </div>
              <h3 className="font-semibold text-navy mb-2">States Covered</h3>
              <p className="text-gray-600 text-sm">Nationwide network of quality properties</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange to-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Contact us today to discuss your housing needs
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-orange font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
