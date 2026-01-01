/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
