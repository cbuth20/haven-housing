import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-heading font-bold mb-4">Haven Housing</h3>
            <p className="text-sm text-gray-300">
              Professional property management and relocation services for insurance,
              corporate, and government clients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-white">
                  Search Properties
                </Link>
              </li>
              <li>
                <Link href="/submit-property" className="text-gray-300 hover:text-white">
                  Submit a Property
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services/insurance-relocation"
                  className="text-gray-300 hover:text-white"
                >
                  Insurance Relocation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/corporate-relocation"
                  className="text-gray-300 hover:text-white"
                >
                  Corporate Relocation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/government-lodging"
                  className="text-gray-300 hover:text-white"
                >
                  Government Lodging
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Email: info@havenhousing.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} Haven Housing Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
