/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'site-review-image-2025.s3.amazonaws.com',
      'site-review-image-2025.s3.ap-southeast-1.amazonaws.com',
      'a0.muscache.com',
      'undefined.s3.amazonaws.com',
      'img.icons8.com'
    ],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      }
    ]
  }
};

module.exports = nextConfig;