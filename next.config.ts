import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.sanity.io',
      pathname: '/images/kdwjys69/production/**'
    },
  ],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
