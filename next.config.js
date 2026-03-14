/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-s3-bucket.s3.amazonaws.com',
      'your-s3-bucket.s3.us-east-1.amazonaws.com',
    ],
  },
}

module.exports = nextConfig
