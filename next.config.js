/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
