/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/signup", destination: "/", permanent: false },
      { source: "/pricing", destination: "/", permanent: false },
      { source: "/account", destination: "/", permanent: false },
      { source: "/account/:path*", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
