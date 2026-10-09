import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The photographs are tall portraits, so the useful breakpoints are
    // narrower than Next's defaults for landscape hero imagery.
    deviceSizes: [360, 420, 640, 828, 1080, 1440, 1920],
    imageSizes: [160, 240, 320, 480],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 78, 80, 82],
  },
};

export default nextConfig;
