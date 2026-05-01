/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Optional: Add basePath if you are deploying to a subdirectory
  // basePath: '/koom-mai',
};

module.exports = nextConfig;
