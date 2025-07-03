import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'media.tenor.com',
      },
      {
        hostname: 'gsoc2024.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
