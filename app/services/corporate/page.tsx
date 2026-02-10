import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import {
  BriefcaseIcon,
  HomeModernIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Corporate Housing & Relocation | Haven Housing Solutions',
  description: 'Seamless, reliable, and fully supported accommodation solutions for employees on the move. Corporate housing for assignments, projects, and relocations.',
}

export default function CorporatePage() {
  const features = [
    {
      icon: HomeModernIcon,
      title: 'Turnkey, Fully Furnished Homes',
      description: 'Our properties are thoughtfully furnished, professionally cleaned, and fully equipped with everything an employee needs to settle in immediately. High-speed Wi-Fi, comfortable workspaces, quality linens, and modern amenities come standard.',
    },
    {
      icon: ClockIcon,
      title: 'Flexible Terms & Fast Response',
      description: 'From single-unit placements to full team accommodations, we work closely with your mobility or HR teams to tailor solutions that fit your goals, timelines, and budget.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Dedicated Support',
      description: 'All utilities and services are managed by Haven Housing Solutions, minimizing workload for your team and ensuring a consistent, high-quality experience for your employees.',
    },
  ]

  const services = [
    'Property sourcing and tailored options',
    'Simplified booking and onboarding',
    'Move-in and move-out coordination',
    'Ongoing guest support',
    'Flexible lease terms to accommodate project changes',
    'Single point of contact and rapid response times',
  ]

  const benefits = [
    'Reliable, vetted, high-quality accommodations',
    'Transparent communication and consistent service',
    'Fast turnarounds for urgent placements',
    'Flexible terms that match corporate needs',
    'A trusted partner committed to employee comfort and satisfaction',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <BriefcaseIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Corporate Housing & Relocation
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Seamless, reliable, and fully supported accommodation solutions for employees on the move
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Haven Housing Solutions, we partner with corporate and relocation companies to provide seamless, reliable, and fully supported accommodation solutions for employees on the move. Whether it's a short-term assignment, long-term contract, internships and projects or full corporate relocation, we ensure every stay is comfortable, convenient, and stress-free.
          </p>

          <div className="bg-orange-50 border-l-4 border-orange p-6 rounded-r-lg">
            <h3 className="text-xl font-semibold text-navy mb-2">
              A Partnership Built on Flexibility and Trust
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We understand that every company—and every employee—has unique needs. That's why we offer a flexible approach to housing, designed to support the demands of fast-paced environments and ever-changing schedules.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg shadow-lg p-8">
              <feature.icon className="h-12 w-12 text-orange mb-4" />
              <h3 className="text-xl font-semibold text-navy mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Employee Focus */}
        <div className="bg-gradient-to-br from-navy to-navy-700 rounded-lg shadow-lg p-8 md:p-12 text-white mb-12">
          <div className="flex items-start gap-4 mb-6">
            <UserGroupIcon className="h-10 w-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-heading font-bold mb-4">
                Employee Comfort is Essential
              </h2>
              <p className="text-lg leading-relaxed text-gray-100">
                Providing employees with safe, comfortable, and stable housing is essential—especially during transitions. Our goal is to help every guest feel at home from day one, allowing them to focus on their new assignment rather than the stress of searching for accommodations.
              </p>
            </div>
          </div>
        </div>

        {/* Streamlined Coordination */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-6">
            Streamlined Coordination & Dedicated Support
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We act as an extension of your relocation and employee-support efforts. Our team handles all logistics, with a single point of contact and rapid response times, we make the housing process effortless for both your team and your employees.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{service}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-4">
            Why Choose Haven Housing Solutions
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Haven Housing Solutions, we bring a level of service, consistency, and care that sets us apart in the corporate and relocation housing industry.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Our focus is simple: deliver exceptional homes, exceptional service, and exceptional experiences—every single time.
          </p>

          <h3 className="text-xl font-semibold text-navy mb-6">
            Corporate partners choose us for:
          </h3>

          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-orange flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to Partner With Us?
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Let's discuss how we can support your corporate housing and relocation needs
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
