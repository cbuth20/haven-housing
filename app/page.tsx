'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Property } from '@/types/property'
import { HomeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const testimonials = [
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
]

function FeaturedProperties() {
  const [featured, setFeatured] = useState<Property[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/.netlify/functions/properties-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published', limit: 12, sortBy: 'featured', sortDirection: 'desc' }),
        })
        if (response.ok) {
          const data = await response.json()
          setFeatured((data.properties || []).filter((p: Property) => p.cover_photo_url))
        }
      } catch {
        // Silently fail
      }
    }
    fetchFeatured()
  }, [])

  useEffect(() => {
    if (featured.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, featured.length - 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [featured.length])

  if (featured.length === 0) return null

  const visibleProperties = featured.slice(currentIndex, currentIndex + 4)
  // Wrap around if needed
  const displayProperties = visibleProperties.length < 4
    ? [...visibleProperties, ...featured.slice(0, 4 - visibleProperties.length)]
    : visibleProperties

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
            Featured Locations
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={property.cover_photo_url!}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold line-clamp-1">{property.title}</p>
                  <p className="text-white/80 text-xs">{property.city}, {property.state}</p>
                </div>
              </Link>
            ))}
          </div>

          {featured.length > 4 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(featured.length / 4) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 4)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    Math.floor(currentIndex / 4) === i ? 'bg-navy' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3)
  const displayTestimonials = visibleTestimonials.length < 3
    ? [...visibleTestimonials, ...testimonials.slice(0, 3 - visibleTestimonials.length)]
    : visibleTestimonials

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 3 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2))
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
            What Our Clients Say.
          </h2>
          <p className="text-lg text-gray-600">
            Real experiences from property owners and managers we&apos;ve worked with.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, i) => (
              <div key={`${testimonial.name}-${i}`} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
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

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
            aria-label="Previous testimonials"
          >
            <ChevronLeftIcon className="h-5 w-5 text-navy" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
            aria-label="Next testimonials"
          >
            <ChevronRightIcon className="h-5 w-5 text-navy" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  currentIndex === i ? 'bg-navy' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial set ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="relative h-[600px] md:h-[700px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop"
            alt="Modern home interior"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6">
              Haven Housing Solutions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              We solve lodging needs for displaced families, government personnel,
              corporate and relocation travelers, project and intern groups, and more.
              Get a customized solution to fit your unique requirements today.
            </p>
            <Link href="/properties">
              <button className="text-lg px-8 py-4 bg-navy text-white hover:bg-navy-700 font-semibold rounded-lg transition-colors">
                FIND HOUSING
              </button>
            </Link>
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
              Specialized relocation and housing solutions tailored to your needs.
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
                href="/services/insurance"
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
                href="/services/corporate"
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
                href="/services/government"
                className="text-orange hover:text-orange-600 font-medium"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <FeaturedProperties />

      {/* Testimonials */}
      <TestimonialsCarousel />

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
