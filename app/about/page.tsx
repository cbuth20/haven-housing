import Image from 'next/image'

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
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Providing exceptional housing solutions with dedication and expertise
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              At Haven Housing Solutions, we are dedicated to solving lodging needs for displaced families,
              government personnel, corporate and relocation travelers, project and intern groups, and more.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our commitment is to provide customized solutions that fit your unique requirements with
              professionalism, transparency, and exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Experienced professionals dedicated to your housing needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Cory */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-navy to-orange flex items-center justify-center">
                <span className="text-white text-8xl font-bold">C</span>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold text-navy mb-2">
                  Cory
                </h3>
                <p className="text-orange font-medium mb-4">Co-Founder</p>
                <p className="text-gray-600">
                  Known for exceptional follow-up, attention to detail, and client-focused service.
                  Cory brings expertise in negotiation and a commitment to delivering flawless results.
                </p>
              </div>
            </div>

            {/* Merrick */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-orange to-navy flex items-center justify-center">
                <span className="text-white text-8xl font-bold">M</span>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold text-navy mb-2">
                  Merrick
                </h3>
                <p className="text-orange font-medium mb-4">Co-Founder</p>
                <p className="text-gray-600">
                  Dedicated to providing seamless housing solutions with a focus on communication
                  and client satisfaction. Merrick ensures every detail is handled with care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
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
            {/* Orla O'Callaghan */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  O
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">Orla</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "Cory was wonderful to work with and his follow up and follow through is second to none!
                He would often call, text or email long after business hours and was really focused on his clients needs."
              </p>
              <p className="text-gray-500 text-sm">October 2024</p>
            </div>

            {/* Obie */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  O
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">Obie</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "Cory was simply amazing. I cannot wait to do business with him again.
                He was efficient, prompt, knowledgeable, customer oriented."
              </p>
              <p className="text-gray-500 text-sm">October 2024</p>
            </div>

            {/* Sean */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">Sean</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "Working with Cory was stress-free and easy. He got us the best possible rate for our homeowner client
                and made the process simple."
              </p>
              <p className="text-gray-500 text-sm">iTrip Annapolis</p>
            </div>

            {/* Joy */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">Joy</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "Cory is so nice to work with and he bring us great tenants! I as a realtor and property manager
                would like to work with him again and again! They are pros, and I give 5 star evaluation!"
              </p>
              <p className="text-gray-500 text-sm">October 2024</p>
            </div>

            {/* George */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  G
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">George</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "It was a pleasure working with Cory and Haven Housing. They were very professional and followed through
                on all their commitments. I would not hesitate to recommend them."
              </p>
              <p className="text-gray-500 text-sm">October 2024</p>
            </div>

            {/* Jennifer */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-navy">Jennifer</h4>
                  <div className="text-orange text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "Cory was great to work with. He was transparent up front with the fee structure,
                and followed up quickly with a contract in hand. He had a thorough understanding of the industry."
              </p>
              <p className="text-gray-500 text-sm">September 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Experience the Haven Housing difference. Let us help you find the perfect housing solution.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/properties"
              className="px-8 py-4 bg-orange text-white hover:bg-orange-600 font-semibold rounded-lg transition-colors"
            >
              View Properties
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-navy hover:bg-gray-100 font-semibold rounded-lg transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
