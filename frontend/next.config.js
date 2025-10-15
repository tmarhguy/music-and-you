/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Enable static export for GitHub Pages
  trailingSlash: true, // Required for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
    domains: ['i.scdn.co', 'mosaic.scdn.co', 'lineup-images.scdn.co'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.music-and-you.com',
    NEXT_PUBLIC_APP_NAME: 'Music and You',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'true',
  },
  // Remove API rewrites for static export
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
  //     },
  //   ];
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
