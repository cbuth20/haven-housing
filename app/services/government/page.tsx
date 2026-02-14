import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import {
  BuildingLibraryIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAmericasIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  HomeModernIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Government Housing & Lodging Services | Haven Housing Solutions',
  description: 'Turnkey temporary housing and lodging services for federal and state government agencies. FEMA Direct Lease, disaster response, military housing, and full contract compliance.',
}

export default function GovernmentPage() {
  const agenciesServed = [
    {
      title: 'Disaster Response & Recovery',
      description: 'Rapid housing deployment for displaced individuals and families following federally declared disasters. FEMA Direct Lease and other emergency housing programs.',
    },
    {
      title: 'Military & Defense Operations',
      description: 'Temporary duty (TDY) housing, PCS relocations, and extended-stay accommodations for active-duty personnel, reservists, and DoD civilians.',
    },
    {
      title: 'Federal Travel & Relocation',
      description: 'Per diem-compliant lodging and housing for federal employees on official travel, temporary assignments, and permanent change of station moves.',
    },
    {
      title: 'Veterans Programs',
      description: 'Transitional and supportive housing solutions for veterans through VA-affiliated programs and community partnerships.',
    },
    {
      title: 'Diplomatic & Security Operations',
      description: 'Secure, discreet housing for personnel supporting diplomatic missions, protective details, and interagency operations across the U.S.',
    },
    {
      title: 'State & Local Emergency Management',
      description: 'Housing support for state OEM agencies and local governments responding to natural disasters, infrastructure emergencies, and community displacement events.',
    },
  ]

  const challenges = [
    {
      title: 'Limited Availability of Compliant Housing',
      description: 'In disaster zones and high-demand markets, finding housing that meets federal habitability, safety, and accessibility standards is difficult. We maintain a deep, pre-vetted property network ready to activate on short notice.',
    },
    {
      title: 'Urgent Timelines',
      description: 'When families need housing in 24-72 hours, there is no room for delays. Our fastest documented activation: 27 units sourced, inspected, and move-in ready within 72 hours.',
    },
    {
      title: 'Compliance & Reporting',
      description: 'Government contracts demand rigorous documentation, HUD-standard inspections, ADA compliance, environmental reviews, and detailed reporting. We build compliance into every step of our process, not as an afterthought.',
    },
    {
      title: 'Small Business Set-Asides',
      description: 'Agencies need qualified small business partners who can actually perform at scale. Haven combines the agility of a small business with the infrastructure and reliability of a large contractor.',
    },
    {
      title: 'Vendor Coordination Complexity',
      description: 'Managing multiple vendors for inspections, furnishings, utilities, maintenance, and reporting creates risk. Haven serves as your single point of contact, managing the entire housing lifecycle under one roof.',
    },
  ]

  const residentialBullets = [
    'Single-family homes, apartments, condos, and townhomes',
    'Fully furnished and move-in ready configurations',
    'HUD housing quality standard (HQS) inspections',
    'ADA-accessible units and reasonable accommodations',
    'Utility setup and ongoing management',
    'Maintenance and property management throughout occupancy',
    'Environmental and floodplain compliance reviews',
    'Lease execution and tenant coordination',
  ]

  const hotelBullets = [
    'Per diem-compliant hotel and extended-stay placements',
    'Negotiated government rates at vetted properties',
    'Group blocks and surge capacity for large deployments',
    'Temporary lodging for TDY, PCS, and disaster response personnel',
    'Centralized booking, billing, and reporting',
    'Ongoing quality assurance and guest support',
  ]

  const processSteps = [
    {
      number: '01',
      title: 'Requirement Definition',
      description: 'We work with your contracting and program teams to define scope, location, unit specifications, compliance requirements, timelines, and budget parameters.',
    },
    {
      number: '02',
      title: 'Property Sourcing & Preparation',
      description: 'Our team activates its nationwide property network to identify, vet, and prepare compliant housing options. Properties are inspected to HUD/HQS standards and configured to meet contract specifications.',
    },
    {
      number: '03',
      title: 'Rapid Activation',
      description: 'Units are furnished, utilities connected, inspections completed, and leases executed. Tenants are coordinated for move-in. Our fastest activation: 27 units in 72 hours.',
    },
    {
      number: '04',
      title: 'Ongoing Management & Reporting',
      description: 'We handle all property management, maintenance, tenant support, and compliance reporting throughout the period of performance. Your team receives regular status updates and documentation.',
    },
    {
      number: '05',
      title: 'Closeout & Turnover',
      description: 'At contract completion, we manage tenant transitions, property restorations, final inspections, and all closeout documentation to ensure a clean handoff with no loose ends.',
    },
  ]

  const whyPartner = [
    {
      title: 'Proven Speed at Scale',
      description: '27 units sourced, inspected, and activated within 72 hours. 97 total units delivered under our FEMA BPA with zero compliance deficiencies.',
    },
    {
      title: 'Compliance From Day One',
      description: 'HUD inspections, ADA accommodations, environmental reviews, and detailed reporting are built into our standard operating procedures, not bolted on after the fact.',
    },
    {
      title: 'True Nationwide Reach',
      description: 'Our property network spans all 50 states. We source and activate housing wherever the mission requires, including rural, remote, and disaster-impacted areas.',
    },
    {
      title: 'Small Business Designation, Large Contractor Capability',
      description: 'We meet small business set-aside requirements while delivering the capacity, reliability, and professionalism expected of much larger firms.',
    },
    {
      title: 'One Point of Contact',
      description: 'From first call to final closeout, you work with a dedicated Haven team lead who owns your program and is accountable for every deliverable.',
    },
    {
      title: 'Processes Built Around Your Contract',
      description: 'We do not force government clients into commercial workflows. Our systems are designed specifically for federal and state contract requirements, timelines, and reporting standards.',
    },
  ]

  const naicsCodes = [
    { code: '531110', description: 'Lessors of Residential Buildings and Dwellings' },
    { code: '531190', description: 'Lessors of Other Real Estate Property' },
    { code: '561599', description: 'Other Travel Arrangement and Reservation Services' },
    { code: '624230', description: 'Emergency and Other Relief Services' },
    { code: '624221', description: 'Temporary Shelters' },
    { code: '721110', description: 'Hotels and Motels (except Casino Hotels)' },
    { code: '721119', description: 'All Other Traveler Accommodations' },
  ]

  const pscCodes = [
    { code: 'V231', description: 'Transportation/Travel/Relocation - Travel/Lodging/Recruitment: Lodging, Hotel/Motel' },
    { code: 'X1FA', description: 'Lease/Rental of Family Housing Facilities' },
    { code: 'S216', description: 'Housekeeping - Lodging' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-navy-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <BuildingLibraryIcon className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              Government Housing & Lodging Services
            </h1>
          </div>
          <p className="text-2xl font-heading font-semibold text-orange-50 mb-4">
            Mission-Ready Housing. Rapid Deployment. Full Accountability.
          </p>
          <p className="text-xl text-gray-200 max-w-4xl">
            Turnkey temporary housing and lodging services for federal and state government agencies—delivered with speed, precision, and complete contract compliance.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            When your mission depends on getting people housed quickly, you need a partner built for speed, scale, and accountability. Haven Housing Solutions is a qualified small business delivering turnkey temporary housing and lodging services to federal and state government agencies nationwide. From disaster response operations to personnel relocations and temporary duty assignments, we solve urgent housing challenges with proven systems—and a single point of contact from first call to final closeout.
          </p>
        </div>

        {/* Section 1: Who We Serve */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <div className="flex items-start gap-4 mb-8">
            <ShieldCheckIcon className="h-10 w-10 text-orange flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-heading font-bold text-navy">
                Who We Serve
              </h2>
              <p className="text-gray-600 mt-2">
                We support a wide range of federal, state, and local government agencies and programs.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agenciesServed.map((agency) => (
              <div key={agency.title} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-navy mb-2">
                  {agency.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {agency.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Challenges We Solve */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <div className="flex items-start gap-4 mb-8">
            <ClockIcon className="h-10 w-10 text-orange flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-heading font-bold text-navy">
                Challenges We Solve
              </h2>
              <p className="text-gray-600 mt-2">
                Government housing is not commercial housing. The stakes are higher, the timelines are tighter, and the rules are more demanding.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="flex items-start gap-4 p-5 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-1">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Our Services */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Our Services
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Residential Housing */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <HomeModernIcon className="h-8 w-8 text-orange" />
                <h3 className="text-xl font-heading font-semibold text-navy">
                  Residential Housing
                </h3>
              </div>
              <p className="text-sm text-gray-500 font-mono mb-4">
                NAICS 531110, 531190, 624230, 624221 | PSC X1FA
              </p>
              <div className="space-y-3">
                {residentialBullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel & Lodging Services */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BuildingOffice2Icon className="h-8 w-8 text-orange" />
                <h3 className="text-xl font-heading font-semibold text-navy">
                  Hotel & Lodging Services
                </h3>
              </div>
              <p className="text-sm text-gray-500 font-mono mb-4">
                NAICS 721110, 721119, 561599 | PSC V231, S216
              </p>
              <div className="space-y-3">
                {hotelBullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: How We Work */}
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

        {/* Section 5: Proven Past Performance */}
        <div className="bg-gradient-to-br from-navy to-navy-700 rounded-lg shadow-lg p-8 md:p-12 text-white mb-12">
          <div className="flex items-start gap-4 mb-8">
            <DocumentCheckIcon className="h-10 w-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-heading font-bold">
                Proven Past Performance
              </h2>
              <p className="text-gray-200 mt-2">
                Our work speaks for itself. Here is our flagship government contract.
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6 md:p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-heading font-semibold mb-6">
              FEMA Direct Lease Program
            </h3>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <p className="text-sm text-gray-300">Contract Number</p>
                <p className="text-lg font-mono font-semibold">70FBR425A00000010</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Contract Type</p>
                <p className="text-lg font-semibold">Blanket Purchase Agreement (BPA), 5-Year</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Period of Performance</p>
                <p className="text-lg font-semibold">December 2024 - 2029</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Contract Value</p>
                <p className="text-lg font-semibold">$3.5M+</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4 text-orange-50">
              Key Accomplishments
            </h4>
            <div className="space-y-3">
              {[
                '97 residential units sourced, inspected, and activated across multiple disaster declarations',
                '27 units deployed within 72 hours of task order issuance — our fastest activation on record',
                'HUD Housing Quality Standard (HQS) inspections completed on every unit prior to occupancy',
                'ADA-accessible units and reasonable accommodations provided as required',
                'Full environmental and floodplain compliance reviews on all properties',
                'Ongoing property management, maintenance, and tenant support throughout occupancy',
                'Detailed reporting and documentation delivered per contract requirements',
                'Zero compliance deficiencies across all task orders',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" />
                  <p className="text-gray-100 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Why Partner With Haven */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <div className="flex items-start gap-4 mb-8">
            <GlobeAmericasIcon className="h-10 w-10 text-orange flex-shrink-0" />
            <h2 className="text-3xl font-heading font-bold text-navy">
              Why Partner With Haven
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPartner.map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Industry Codes */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-8">
            Industry Codes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* NAICS Codes */}
            <div>
              <h3 className="text-xl font-heading font-semibold text-navy mb-4">
                NAICS Codes
              </h3>
              <div className="space-y-3">
                {naicsCodes.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-navy">{item.code}</p>
                      <p className="text-gray-700 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PSC Codes */}
            <div>
              <h3 className="text-xl font-heading font-semibold text-navy mb-4">
                PSC Codes
              </h3>
              <div className="space-y-3">
                {pscCodes.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-navy">{item.code}</p>
                      <p className="text-gray-700 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Business Credentials */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy mb-6">
            Business Credentials
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-1">UEI</p>
              <p className="text-xl font-mono text-navy font-bold">HUHKMBJVN178</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-1">CAGE Code</p>
              <p className="text-xl font-mono text-navy font-bold">9WGC7</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-1">Business Size</p>
              <p className="text-xl text-navy font-bold">Small Business</p>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/capabilities-statement.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              Download Capabilities Statement
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange to-orange-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Let&apos;s Talk
          </h2>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
            Ready to discuss your government housing requirements? Contact us today to learn how Haven Housing Solutions can support your mission.
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
