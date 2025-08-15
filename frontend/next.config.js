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
    // Proxy ALL /api/* calls to the backend URL in every environment
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/:path*`
      }
    ]
  }
}

module.exports = nextConfig


