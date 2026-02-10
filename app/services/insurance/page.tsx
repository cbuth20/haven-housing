import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { ShieldCheckIcon, HomeIcon, CalendarIcon, UserGroupIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Insurance Placement Housing | Haven Housing Solutions',
  description: 'Tailored temporary housing solutions for those facing displacement. Seamless relocation experience for policyholders and insurance providers.',
}

export default function InsurancePage() {
  const services = [
    {
      icon: HomeIcon,
      title: 'Furnished and Unfurnished Housing',
      description: 'We offer furnished homes equipped with all necessary amenities to help families feel at home from day one, along with unfurnished housing for families in need of longer stays.',
    },
    {
      icon: CalendarIcon,
      title: 'Flexible Lease Terms',
      description: 'We offer short and long-term options to accommodate the varying needs of insurance relocations.',
    },
    {
      icon: UserGroupIcon,
      title: 'Personalized Support',
      description: 'From the initial consultation to move-in, our team is committed to providing dedicated customer service and handling every detail to ensure a stress-free experience.',
    },
  ]

  const process = [
    {
      number: '01',
      title: 'Understanding Client Needs',
      description: 'We work closely with insurance providers to understand the specific housing requirements of their clients, including location, budget, special requirements, and duration of stay.',
    },
    {
      number: '02',
      title: 'Property Selection',
      description: 'Based on these requirements, we quickly identify the most suitable temporary housing options from our extensive network of properties. If we cannot offer something within the network, we will expand our search beyond to present housing options.',
    },
    {
      number: '03',
      title: 'Lease and Payment Checklist Support',
      description: 'Our team can assist in drafting a lease and collecting paperwork for payment to ensure an efficient process and timely move in for the family.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Insurance Placement Housing
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Tailored temporary housing solutions for those facing displacement
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-6">
            What We Do
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We offer tailored temporary housing solutions to meet the specific needs of those facing displacement. With a wide range of properties available, we provide everything from short-term stays in apartments and condos to longer-term rentals in single-family homes. Our focus is on creating a seamless relocation experience for both the policyholder and the insurance provider.
          </p>

          <h3 className="text-2xl font-heading font-semibold text-navy mb-6">
            Services We Offer
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-gray-50 rounded-lg p-6">
                <service.icon className="h-10 w-10 text-orange mb-4" />
                <h4 className="text-xl font-semibold text-navy mb-3">
                  {service.title}
                </h4>
                <p className="text-gray-700">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How We Operate */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            How We Operate
          </h2>

          <div className="space-y-8">
            {process.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-orange text-white flex items-center justify-center text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-br from-navy to-navy-700 rounded-lg shadow-lg p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-heading font-bold mb-6">
            Why Choose Us?
          </h2>
          <p className="text-lg leading-relaxed text-gray-100">
            At Haven Housing Solutions, your peace of mind is our priority. We pride ourselves on being responsive, resourceful, and reliable. Our strong relationships with both insurance professionals and property owners allow us to provide high-quality housing in a timely manner, reducing the burden on families during stressful times.
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Let Us Help You
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Contact us today to learn more about how we can assist with your temporary housing needs. We're here to help!
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
