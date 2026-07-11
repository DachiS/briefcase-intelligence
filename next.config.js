/** @type {import('next').NextConfig} */

// Derive the allowed S3 image host from env so it always matches the real
// bucket instead of a stale placeholder. Covers both the global and
// region-scoped virtual-hosted S3 URL styles.
const bucket = process.env.AWS_S3_BUCKET
const region = process.env.AWS_REGION
const remotePatterns = bucket
  ? [
      { protocol: 'https', hostname: `${bucket}.s3.amazonaws.com` },
      ...(region ? [{ protocol: 'https', hostname: `${bucket}.s3.${region}.amazonaws.com` }] : []),
    ]
  : []

const nextConfig = {
  images: {
    remotePatterns,
  },
}

module.exports = nextConfig
