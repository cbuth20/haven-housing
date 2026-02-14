import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import {
  BriefcaseIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Corporate Housing & Relocation | Haven Housing Solutions',
  description:
    'Flexible, fully managed corporate housing solutions for relocations, assignments, and projects. Turnkey accommodations your employees and mobility teams can count on.',
}

export default function CorporatePage() {
  const whoWeServe = [
    'Permanent Relocations',
    'Extended Assignments',
    'Short-Term Projects',
    'Intern & Trainee Programs',
    'Emergency & Last-Minute Placements',
    'Lump-Sum Relocatees',
  ]

  const challenges = [
    {
      title: 'Inconsistent Property Quality',
      description:
        'Many providers offer listings sight-unseen with no quality assurance. Haven personally vets every property to ensure it meets our standards for cleanliness, comfort, and functionality before an employee ever walks through the door.',
    },
    {
      title: 'Rigid Lease Terms',
      description:
        'Corporate timelines shift—projects extend, assignments end early, and start dates move. We offer flexible lease structures that adapt to the realities of business, so you never pay for time you don\'t need.',
    },
    {
      title: 'Lack of Responsiveness',
      description:
        'When an employee has an issue at 9 PM or a relocation manager needs an urgent update, waiting until "business hours" isn\'t good enough. Our team is responsive, accessible, and proactive in communication.',
    },
    {
      title: 'Hidden Fees and Cost Uncertainty',
      description:
        'Surprise charges erode trust and blow budgets. We provide transparent, all-inclusive pricing so your team always knows what to expect—no hidden fees, no billing surprises.',
    },
    {
      title: 'Coordination Across Multiple Vendors',
      description:
        'Juggling separate providers for furniture, utilities, cleaning, and maintenance creates confusion and delays. Haven handles it all under one roof, acting as your single point of contact for every aspect of the stay.',
    },
  ]

  const amenities = [
    'High-speed Wi-Fi and dedicated workspaces',
    'Quality linens, towels, and kitchen essentials',
    'In-unit washer and dryer (where available)',
    'Professionally cleaned before every move-in',
    'Climate control, smart TVs, and modern appliances',
    'All utilities included and managed by Haven',
  ]

  const accommodationTypes = [
    'Apartments and condos in prime locations',
    'Single-family homes for families and longer stays',
    'Extended-stay suites for short-term needs',
    'Pet-friendly properties available upon request',
  ]

  const coordinationItems = [
    'Property sourcing and tailored recommendations',
    'Lease execution and move-in scheduling',
    'Utility setup and ongoing management',
    'Maintenance coordination and issue resolution',
    'Move-out inspections and deposit processing',
  ]

  const processSteps = [
    {
      number: '01',
      title: 'Intake & Requirements',
      description:
        'We learn about your program, policies, timelines, budget, and employee preferences to build a clear picture of what\'s needed.',
    },
    {
      number: '02',
      title: 'Property Sourcing & Selection',
      description:
        'We identify vetted properties that match your criteria and present curated options—not endless, unfiltered listings.',
    },
    {
      number: '03',
      title: 'Booking & Onboarding',
      description:
        'Once a property is selected, we handle lease execution, utility activation, furnishing confirmation, and provide the employee with everything they need for a smooth arrival.',
    },
    {
      number: '04',
      title: 'Ongoing Support',
      description:
        'Throughout the stay, our team is available to address maintenance requests, answer questions, coordinate extensions or early departures, and ensure the employee is comfortable.',
    },
    {
      number: '05',
      title: 'Move-Out & Closeout',
      description:
        'We manage the move-out process, conduct inspections, handle deposit returns, and provide final reporting to your team—closing the loop cleanly and professionally.',
    },
  ]

  const whyPartners = [
    {
      title: 'Reliable, Vetted Properties',
      description:
        'Every home meets our quality standards before an employee ever steps inside.',
    },
    {
      title: 'Transparent Communication',
      description:
        'You\'ll always know where things stand—no guesswork, no chasing updates.',
    },
    {
      title: 'Fast Turnarounds',
      description:
        'We move quickly to meet tight timelines, including urgent and last-minute placements.',
    },
    {
      title: 'Flexible Terms',
      description:
        'Our lease structures are designed to flex with your business needs, not against them.',
    },
    {
      title: 'Cost Predictability',
      description:
        'All-inclusive pricing means no surprise invoices and easier budget management.',
    },
    {
      title: 'Duty of Care Support',
      description:
        'We help you fulfill your responsibility to provide safe, comfortable housing for employees in transition.',
    },
    {
      title: 'A True Partnership',
      description:
        'We don\'t just fill units—we invest in understanding your program and earning your trust over time.',
    },
  ]

  const differentiators = [
    {
      title: 'Personalized Solutions, Not Generic Listings',
      description:
        'We take the time to understand each placement and recommend properties that truly fit—not just what\'s available.',
    },
    {
      title: 'Consistency You Can Count On',
      description:
        'Whether it\'s the first placement or the fiftieth, we deliver the same high standard of quality and service every time.',
    },
    {
      title: 'A Single Point of Contact',
      description:
        'No call centers, no runarounds. Your dedicated contact knows your account, your preferences, and your employees by name.',
    },
    {
      title: 'Employee-Centered Service',
      description:
        'We treat every employee like a guest, not a transaction. Their comfort and well-being are at the center of everything we do.',
    },
    {
      title: 'Built for Business Realities',
      description:
        'We understand that plans change, timelines shift, and flexibility matters. Our processes are built to adapt—because yours have to.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <BriefcaseIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Corporate Housing That Works as Hard as Your Team
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Flexible, fully managed accommodation solutions for relocations,
            assignments, and projects—delivered with consistency your employees
            and mobility teams can count on.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Haven Housing Solutions partners with corporations, relocation
            management companies, and HR teams to deliver seamless, reliable
            housing for employees on the move. Whether it&apos;s a short-term
            project, an extended assignment, intern housing, or a full permanent
            relocation, we provide turnkey accommodations tailored to your
            program requirements—so your employees can focus on their work, not
            their living situation.
          </p>
        </div>

        {/* Who We Serve */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Who We Serve
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whoWeServe.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <CheckCircleIcon className="h-6 w-6 text-orange flex-shrink-0" />
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Challenges We Solve */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            The Challenges We Solve
          </h2>
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.title}
                className="bg-gray-50 rounded-lg p-6 border-l-4 border-orange"
              >
                <h3 className="text-xl font-semibold text-navy mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Our Services
          </h2>

          {/* Turnkey Fully Furnished Homes */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-6">
            <h3 className="text-2xl font-heading font-semibold text-navy mb-4">
              Turnkey, Fully Furnished Homes
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our properties are thoughtfully furnished, professionally cleaned,
              and fully equipped with everything an employee needs to settle in
              immediately.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{amenity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flexible Accommodation Types */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-6">
            <h3 className="text-2xl font-heading font-semibold text-navy mb-4">
              Flexible Accommodation Types
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We match the right property type to the right situation, ensuring
              comfort and convenience for every employee.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {accommodationTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircleIcon className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* End-to-End Coordination */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-6">
            <h3 className="text-2xl font-heading font-semibold text-navy mb-4">
              End-to-End Coordination
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We manage every detail so your team doesn&apos;t have to.
            </p>
            <div className="space-y-3">
              {coordinationItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nationwide Reach */}
          <div className="bg-gradient-to-br from-navy to-navy-700 rounded-lg shadow-lg p-8 md:p-12 text-white">
            <h3 className="text-2xl font-heading font-semibold mb-4">
              Nationwide Reach
            </h3>
            <p className="text-lg leading-relaxed text-gray-100">
              Whether your employees are relocating to major metro areas or
              smaller markets, Haven Housing Solutions has the network and
              relationships to source quality accommodations across the country.
              We go beyond our existing inventory to find the right fit—wherever
              the assignment takes them.
            </p>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            How We Work
          </h2>
          <div className="space-y-8">
            {processSteps.map((step) => (
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

        {/* Why Corporate Partners Choose Haven */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Why Corporate Partners Choose Haven
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPartners.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-lg shadow p-6"
              >
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircleIcon className="h-6 w-6 text-orange flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-semibold text-navy">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-9">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Haven Different */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            What Makes Haven Different
          </h2>
          <div className="space-y-6">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-l-4 border-navy"
              >
                <BriefcaseIcon className="h-8 w-8 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Let&apos;s Talk About Your Next Move
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Whether you need housing for one employee or an entire team, we're
            ready to build a solution that works for your program.
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
