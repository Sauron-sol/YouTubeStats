/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['yt3.ggpht.com', 'i.ytimg.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
      allowedForwardedHosts: ["localhost:3000"],
      maxDuration: 5
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig 