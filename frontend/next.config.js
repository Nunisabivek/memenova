/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  async rewrites() {
    // Dev proxy to local backend if NEXT_PUBLIC_API_URL not set
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/:path*'
        }
      ]
    }
    return []
  }
}

module.exports = nextConfig


