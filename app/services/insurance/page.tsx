'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import {
  ShieldCheckIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  HomeModernIcon,
  CurrencyDollarIcon,
  HandThumbUpIcon,
  PhoneIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  TruckIcon,
  HeartIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

/* ------------------------------------------------------------------ */
/*  Accordion primitive                                                */
/* ------------------------------------------------------------------ */

function AccordionItem({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-lg font-semibold text-navy">{title}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-navy transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-6 pb-6 pt-2 bg-white">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const whoWeServe = [
  {
    icon: ShieldCheckIcon,
    title: 'Insurance Carriers',
    description:
      'We serve as a reliable housing extension for carriers looking to streamline ALE fulfillment, reduce cycle times, and improve policyholder satisfaction scores.',
  },
  {
    icon: DocumentChartBarIcon,
    title: 'TPAs (Third-Party Agencies)',
    description:
      'We integrate into TPA workflows to handle the housing component end-to-end, giving your team more bandwidth to focus on claims management.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Public Adjusters',
    description:
      'We partner with public adjusters to ensure their clients receive fast, high-quality housing placements that reflect well on the adjuster and keep the claims process moving.',
  },
  {
    icon: UserGroupIcon,
    title: 'Policyholders',
    description:
      'We treat every displaced family with empathy and personal attention, guiding them through the housing process with clear communication and genuine care.',
  },
]

const processSteps = [
  {
    number: '01',
    icon: PhoneIcon,
    title: 'Claim Intake & Needs Assessment',
    description:
      'We gather essential details about the policyholder\'s household, preferences, location needs, accessibility requirements, pet accommodations, and timeline to ensure the right fit from the start.',
  },
  {
    number: '02',
    icon: MagnifyingGlassIcon,
    title: 'Property Sourcing',
    description:
      'Leveraging our extensive network of vetted properties and landlord relationships, we quickly identify suitable housing options that match the family\'s needs and ALE budget parameters.',
  },
  {
    number: '03',
    icon: DocumentTextIcon,
    title: 'Options & Quotes',
    description:
      'We present curated housing options with transparent pricing, detailed property information, and photos so the adjuster and policyholder can make informed decisions quickly.',
  },
  {
    number: '04',
    icon: HomeModernIcon,
    title: 'Showing Coordination',
    description:
      'We schedule and coordinate property showings at the family\'s convenience, accompanying them to answer questions and provide support throughout the selection process.',
  },
  {
    number: '05',
    icon: ClipboardDocumentCheckIcon,
    title: 'Lease Negotiation & Execution',
    description:
      'Our team handles all lease negotiations, ensuring favorable terms that protect both the policyholder and the insurance carrier while maintaining compliance with ALE guidelines.',
  },
  {
    number: '06',
    icon: CurrencyDollarIcon,
    title: 'Pre-Placement Payment & Move-In',
    description:
      'We coordinate all upfront payments, security deposits, and move-in logistics so the family can settle into their temporary home without delays or complications.',
  },
  {
    number: '07',
    icon: HeartIcon,
    title: 'Ongoing Support & Management',
    description:
      'Throughout the placement, we serve as the primary point of contact for the policyholder, handling maintenance requests, lease extensions, and any issues that arise.',
  },
  {
    number: '08',
    icon: TruckIcon,
    title: 'Move-Out & Documentation',
    description:
      'When the family is ready to return home, we coordinate the move-out process, conduct inspections, handle deposit returns, and provide complete documentation for the claims file.',
  },
]

const whyChooseUs = [
  {
    icon: ClockIcon,
    title: 'Fast Turnaround',
    description:
      'Hotel placements within hours. Long-term furnished housing options presented within 24 hours of intake.',
  },
  {
    icon: DocumentChartBarIcon,
    title: 'Transparent Tracking & Reporting',
    description:
      'Real-time status updates, detailed placement reports, and full documentation so adjusters always know where things stand.',
  },
  {
    icon: UserGroupIcon,
    title: 'Personalized Care from a Small Team',
    description:
      'As a boutique firm, we provide the kind of attentive, relationship-driven service that large vendors simply cannot match.',
  },
  {
    icon: HomeModernIcon,
    title: 'Flexible & Customized Housing',
    description:
      'From pet-friendly apartments to ADA-accessible homes, we source housing tailored to each family\'s unique circumstances.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Smooth Fund Handling & Compliance',
    description:
      'We manage payments, security deposits, and invoicing with full transparency and compliance with ALE guidelines.',
  },
  {
    icon: HandThumbUpIcon,
    title: 'High Satisfaction Rates',
    description:
      'Our policyholders consistently report high satisfaction with their housing experience, reflecting positively on the carrier and adjuster.',
  },
]

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function InsurancePage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Insurance Housing Services
            </h1>
          </div>
          <p className="text-2xl font-semibold text-white max-w-4xl mb-4">
            Temporary Housing for Displaced Policyholders. Fast Placement. Full
            Support. Personal Care.
          </p>
          <p className="text-xl text-gray-200 max-w-3xl">
            Haven Housing Solutions partners with insurance carriers, TPAs, and
            adjusters to deliver seamless, compassionate housing solutions for
            families when they need it most.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-6">
            A Partner You Can Trust
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            When a family is displaced from their home, they need more than a
            roof over their head&mdash;they need support, stability, and someone
            who treats them with care. Haven Housing Solutions provides temporary
            housing services for insurance carriers, third-party agencies (TPAs),
            and public adjusters handling Additional Living Expense (ALE) claims.
            We manage every aspect of the housing process&mdash;from initial
            intake and property sourcing to lease execution, ongoing support, and
            move-out coordination&mdash;so adjusters can focus on the claim, and
            policyholders can focus on getting back on their feet.
          </p>
        </div>

        {/* Who We Serve */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Who We Serve
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {whoWeServe.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-lg p-6 flex items-start gap-4"
              >
                <item.icon className="h-10 w-10 text-orange flex-shrink-0 mt-1" />
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

        {/* How We Work */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            How We Work
          </h2>
          <div className="space-y-6">
            {processSteps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-orange text-white flex items-center justify-center text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="pt-2">
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

        {/* Why Insurance Partners Choose Haven */}
        <div className="bg-gradient-to-br from-navy to-navy-700 rounded-lg shadow-lg p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-heading font-bold mb-8">
            Why Insurance Partners Choose Haven
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <item.icon className="h-8 w-8 text-orange flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8 text-center">
            Learn More About How We Help
          </h2>
          <div className="space-y-4">
            {/* TPA Accordion */}
            <AccordionItem
              title="Third-Party Agencies (TPAs)"
              isOpen={openAccordion === 0}
              onToggle={() => toggleAccordion(0)}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    Built for TPA Workflows
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    We understand that TPAs operate as the critical link between
                    carriers and policyholders. Our processes are designed to
                    integrate seamlessly into your existing workflows, reducing
                    friction and keeping claims moving efficiently.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    What We Provide
                  </h4>
                  <div className="space-y-3">
                    {[
                      'End-to-end housing management from intake through move-out',
                      'Detailed status updates and reporting aligned with your tracking systems',
                      'Quick-turnaround placements that keep claims on schedule',
                      'Direct communication with policyholders to reduce your team\'s workload',
                      'Comprehensive move-out documentation for clean claims closure',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange p-5 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-navy mb-2">
                    A Partner Who Makes Your Job Easier
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    We know your reputation depends on delivering results for
                    your carrier clients. Haven Housing Solutions operates as an
                    extension of your team, delivering the kind of responsive,
                    high-quality service that strengthens your carrier
                    relationships and keeps policyholders satisfied.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Insurance Carriers Accordion */}
            <AccordionItem
              title="Insurance Carriers"
              isOpen={openAccordion === 1}
              onToggle={() => toggleAccordion(1)}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    Supporting Your Policyholders
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Your policyholders are going through one of the most
                    stressful experiences of their lives. Haven Housing Solutions
                    ensures they receive fast, compassionate housing support that
                    reflects the level of care your brand promises.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    What We Deliver
                  </h4>
                  <div className="space-y-3">
                    {[
                      'Rapid placement that reduces hotel overstays and ALE spend',
                      'Consistent, high-quality housing experiences across all placements',
                      'Full compliance with ALE guidelines and transparent invoicing',
                      'Dedicated account management for streamlined communication',
                      'Detailed reporting and documentation that supports clean claims files',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    Measurable Results
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Our clients see faster placement times, reduced ALE costs
                    through efficient housing sourcing, and higher policyholder
                    satisfaction scores. We provide the data and reporting to
                    prove it.
                  </p>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange p-5 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-navy mb-2">
                    Let&apos;s Build a Partnership
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    We work best as a long-term partner, not a one-time vendor.
                    Let us show you how Haven Housing Solutions can become a
                    trusted part of your ALE fulfillment strategy.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Policyholders Accordion */}
            <AccordionItem
              title="Policyholders"
              isOpen={openAccordion === 2}
              onToggle={() => toggleAccordion(2)}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    We&apos;re Here to Make This Easier
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    If you&apos;ve been displaced from your home due to a fire,
                    storm, or other covered event, we understand how overwhelming
                    this time can be. Haven Housing Solutions is here to take the
                    housing burden off your shoulders so you can focus on what
                    matters most&mdash;your family and your recovery.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    What to Expect
                  </h4>
                  <div className="space-y-3">
                    {[
                      'A dedicated housing coordinator who guides you through every step',
                      'Thoughtfully selected homes that match your family\'s needs and preferences',
                      'Clear communication so you always know what\'s happening and what\'s next',
                      'Help with move-in logistics, utilities, and settling into your temporary home',
                      'Ongoing support throughout your stay for any questions or issues',
                      'A smooth, stress-free move-out process when you\'re ready to return home',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    We Accommodate Your Needs
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Whether you have pets, need ADA-accessible housing, require
                    proximity to your children&apos;s school, or have other
                    specific requirements, we work diligently to find a temporary
                    home that feels right for your family.
                  </p>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange p-5 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-navy mb-2">
                    You&apos;re Not Alone
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Displacement is stressful, but you don&apos;t have to
                    navigate it alone. Our team genuinely cares about your
                    well-being and will be with you every step of the way until
                    you&apos;re back home.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Catastrophe Response Accordion */}
            <AccordionItem
              title="Catastrophe (CAT) Response"
              isOpen={openAccordion === 3}
              onToggle={() => toggleAccordion(3)}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    Ready When You Need Us
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    When a catastrophe strikes, the demand for temporary housing
                    surges overnight. Haven Housing Solutions is prepared to
                    rapidly scale operations to support carriers and TPAs during
                    large-scale displacement events including hurricanes,
                    wildfires, floods, and tornadoes.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-navy mb-3">
                    CAT Capabilities
                  </h4>
                  <div className="space-y-3">
                    {[
                      'Rapid activation and high-volume intake processing',
                      'Broad property sourcing across affected and surrounding regions',
                      'Coordination with local landlords, property managers, and hospitality providers',
                      'Scalable team deployment to handle surge demand',
                      'Centralized tracking and reporting across all active placements',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-navy mb-3">
                      Regional Responsiveness
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Our established relationships with property owners and
                      managers across multiple regions allow us to source housing
                      quickly in areas where availability is limited during
                      catastrophic events.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-navy mb-3">
                      Surge Support
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      We scale our team and operations to meet the demands of
                      high-volume events, ensuring that every displaced family
                      receives the same level of personal attention and care
                      regardless of volume.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange p-5 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-navy mb-2">
                    A Partner You Can Count On
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    In the chaos following a catastrophe, you need a housing
                    partner who responds quickly, communicates clearly, and
                    delivers results. Haven Housing Solutions is that partner.
                  </p>
                </div>
              </div>
            </AccordionItem>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-lg mb-6 text-white/90">
            Ready to streamline your ALE housing process? Contact us today to
            learn how Haven Housing Solutions can support your team and your
            policyholders.
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
