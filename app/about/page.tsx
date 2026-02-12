import Link from 'next/link'

const teamMembers = [
  {
    name: 'Cory Yoviene',
    title: 'Co-Founder & Chief Executive Officer',
    bio: "Cory's background in supply chain, marketing, national account management, and real estate operations shapes Haven Housing's customer-first, speed-driven approach. With experience leading negotiations for top multifamily groups nationwide, Cory focuses on strategic growth, partner success, and ensuring HHS continues to raise the standard for temporary housing.",
    location: 'San Diego, CA',
    interests: 'Surfing, tennis, skiing, and the outdoors',
    initials: 'CY',
    gradient: 'from-navy to-navy-700',
  },
  {
    name: 'Merrick Kovatch',
    title: 'Co-Founder & Chief Executive Officer',
    bio: "With a degree in Marine Engineering, an Unlimited Tonnage Engineer's License, and service in the U.S. Navy Reserve, Merrick brings precision, leadership, and operational discipline to the company. His background managing complex systems aboard commercial vessels informs the structure and reliability of Haven Housing's nationwide operations.",
    location: 'Kailua, HI',
    interests: 'Traveling, surfing, freediving, and exploring the outdoors',
    initials: 'MK',
    gradient: 'from-navy-700 to-navy',
  },
  {
    name: 'Juliet Howie',
    title: 'VP of Sales, Corporate Housing',
    bio: 'Juliet brings a wealth of experience in the industry and a true passion for building meaningful partnerships. As a respected committee chair for GBTA EMEA, her insight, expertise, and vision play a key role in shaping the future of Haven\'s corporate housing initiative. Her deep understanding of the corporate travel and housing landscape, combined with her heart for service, perfectly aligns with our mission.',
    initials: 'JH',
    gradient: 'from-orange to-orange-600',
  },
  {
    name: 'Deserie Foley',
    title: 'Insurance Housing Specialist',
    bio: 'Deserie is an experienced professional in the insurance housing industry with over 10 years of dedicated service. One of her most significant achievements is running retreats focused on healing and spiritual growth, helping others on their journeys. Originally from Southern California, Deserie now resides in Florida, where she continues to pursue her passions and make a positive impact in her community.',
    initials: 'DF',
    gradient: 'from-orange-600 to-orange',
  },
  {
    name: 'Terri Royse',
    title: 'Housing Solutions Specialist',
    bio: 'With extensive experience in insurance, catastrophe, and corporate housing, Terri brings a wealth of knowledge and expertise to the team. Over the years, she has built a strong reputation for delivering innovative solutions across various industry sectors. A bibliophile and artist, Terri spends her free time altering old books and creating art journals.',
    initials: 'TR',
    gradient: 'from-navy to-orange',
  },
]

const coreValues = [
  {
    title: 'Empathy First',
    description: 'Every placement represents someone experiencing stress or hardship. We begin with understanding and compassion.',
  },
  {
    title: 'Integrity Always',
    description: 'We operate transparently and ethically — with our partners, clients, and each other.',
  },
  {
    title: 'Reliability at Every Step',
    description: 'From intake to placement to support, we deliver consistent, dependable service.',
  },
  {
    title: 'Solutions Oriented',
    description: 'We treat challenges as opportunities and act quickly, creatively, and effectively.',
  },
  {
    title: 'Scalable Support, Boutique Care',
    description: 'Whether supporting 10 units or 1,000, our standard of care stays personal and thoughtful.',
  },
  {
    title: 'Affordability with Dignity',
    description: 'Every individual deserves a clean, safe, and dignified place to stay — without compromising value for our partners.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
            alt="About Haven Housing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            When life turns upside down, people need more than a place to sleep — they need stability, compassion, and someone who moves quickly so they can breathe again.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-8 text-center">
              Our Story
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Haven Housing Solutions was born from a simple truth: when life turns upside down, people need more than a place to sleep — they need stability, compassion, and someone who moves quickly so they can breathe again.
              </p>

              <p>
                Our founders, Cory Yoviene and Merrick Kovatch, never set out to build another "housing company." Their journey started years earlier on the beaches of Fenwick Island, DE, where they worked side-by-side as lifeguards. What began as a summer job and a friendship evolved into multiple ventures, a shared entrepreneurial mindset, and ultimately a mission-driven company that now serves families, insurance carriers, government agencies, and corporate partners nationwide.
              </p>

              <p>
                Their first business together was in short-term rentals. They bought and managed vacation homes, focusing on service, hospitality, and operational excellence. Then the world shut down during COVID-19 — and everything changed.
              </p>

              <p>
                Instead of walking away, they dug in. They analyzed every reservation, every stay, every guest who had ever walked through their doors. That's when they discovered something important: a significant portion of their revenue came from families displaced by disaster, employees on assignment, and people who needed temporary housing during difficult transitions.
              </p>

              <div className="bg-orange/5 border-l-4 border-orange rounded-r-lg p-6 my-8">
                <p className="text-xl font-heading font-semibold text-navy italic">
                  Something clicked. They realized they could help more people — faster and at a larger scale — by becoming the bridge between those who need safe, dependable housing and those who provide it.
                </p>
              </div>

              <p>
                No bureaucracy. No red tape. No wasted time. Just responsive, human-centered housing solutions when people need them most.
              </p>

              <p>
                Months of market research, industry analysis, and customer interviews later, Haven Housing Solutions was created with one goal: <strong className="text-navy">deliver speed, value, flexibility, and empathy at a level the temporary housing industry had never seen.</strong>
              </p>

              <p>
                Cory and Merrick credit their unconventional path as their greatest strength. Coming from outside the industry allowed them to look at temporary housing with a fresh, unbiased lens — seeing gaps and inefficiencies others had accepted as "normal," and designing solutions that put people, not process, at the center.
              </p>

              <p className="text-navy font-semibold text-xl">
                Today, Haven Housing Solutions is one of the fastest-growing housing providers in the nation, built on a foundation of service, integrity, and "listen first, deliver always" leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The WHY Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              The WHY Behind What We Do
            </h2>
            <p className="text-lg text-white/80 mb-4">
              Every call we receive represents someone in crisis — a flooded home, a fire, a government deployment, a forced relocation, a family uncertain about the next step. We exist to be the steady hand in that moment.
            </p>
            <p className="text-2xl font-heading font-semibold text-orange mb-10">
              To make people feel safe, supported, and seen when life becomes overwhelming.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {[
                { text: 'Moving fast when time matters' },
                { text: 'Delivering better value so partners can serve more families' },
                { text: 'Providing flexible options that meet unique needs' },
                { text: 'Removing friction from an already stressful transition' },
                { text: 'Treating every stay like someone\'s home, not a transaction' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <p className="text-white/90">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-lg text-white/80 max-w-3xl mx-auto">
              When families feel cared for, adjusters feel supported, and agencies feel confident that their people are in good hands — we know we've fulfilled our mission.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Haven Housing Solutions, our mission is to provide safe, compassionate, and dependable housing for individuals and families during times of crisis and transition. We exist to deliver comfort, stability, and peace of mind when it matters most. Through responsive service and human-centered care, we turn disruption into comfort.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make and every family we serve
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow border-t-4 border-orange">
                <h3 className="text-xl font-heading font-bold text-navy mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The people behind Haven Housing Solutions — driven by service, guided by empathy
            </p>
          </div>

          {/* Co-Founders - Featured */}
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-14">
            {teamMembers.slice(0, 2).map((member) => (
              <div key={member.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`aspect-[4/3] bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                  <span className="text-white text-7xl font-bold opacity-80">{member.initials}</span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-heading font-bold text-navy mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange font-semibold mb-4">{member.title}</p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  {member.location && (
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <span>{member.location}</span>
                      {member.interests && <span className="hidden sm:inline">|</span>}
                      {member.interests && <span className="hidden sm:inline">{member.interests}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Other Team Members */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.slice(2).map((member) => (
              <div key={member.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`aspect-[3/2] bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                  <span className="text-white text-5xl font-bold opacity-80">{member.initials}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-navy mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange font-semibold text-sm mb-3">{member.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from property owners and managers we've worked with
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Orla',
                initial: 'O',
                quote: 'Cory was wonderful to work with and his follow up and follow through is second to none! He would often call, text or email long after business hours and was really focused on his clients needs.',
                date: 'October 2024',
              },
              {
                name: 'Obie',
                initial: 'O',
                quote: 'Cory was simply amazing. I cannot wait to do business with him again. He was efficient, prompt, knowledgeable, customer oriented.',
                date: 'October 2024',
              },
              {
                name: 'Sean',
                initial: 'S',
                quote: 'Working with Cory was stress-free and easy. He got us the best possible rate for our homeowner client and made the process simple.',
                date: 'iTrip Annapolis',
              },
              {
                name: 'Joy',
                initial: 'J',
                quote: 'Cory is so nice to work with and he bring us great tenants! I as a realtor and property manager would like to work with him again and again! They are pros, and I give 5 star evaluation!',
                date: 'October 2024',
              },
              {
                name: 'George',
                initial: 'G',
                quote: 'It was a pleasure working with Cory and Haven Housing. They were very professional and followed through on all their commitments. I would not hesitate to recommend them.',
                date: 'October 2024',
              },
              {
                name: 'Jennifer',
                initial: 'J',
                quote: 'Cory was great to work with. He was transparent up front with the fee structure, and followed up quickly with a contract in hand. He had a thorough understanding of the industry.',
                date: 'September 2024',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.initial}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-navy">{testimonial.name}</h4>
                    <div className="text-orange text-sm">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-gray-500 text-sm">{testimonial.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Experience the Haven Housing difference. Let us help you find the perfect housing solution.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/properties"
              className="px-8 py-4 bg-orange text-white hover:bg-orange-600 font-semibold rounded-lg transition-colors"
            >
              View Properties
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-navy hover:bg-gray-100 font-semibold rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
