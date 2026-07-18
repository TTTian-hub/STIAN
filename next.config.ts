import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  distDir: '.next',
  // Keep these packages out of the server bundle so they resolve from
  // node_modules at runtime (standalone tracing misses their dynamic requires).
  serverExternalPackages: ['@tencent-ai/agent-sdk', '@cloudbase/node-sdk'],
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'lunar-typescript',
    ],
  },
  // Enable compression
  compress: true,
  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,
  // Trailing slash for SEO
  trailingSlash: false,
  // Powered by header
  poweredByHeader: false,

  // CLI support - dynamic port
  env: {
    PORT: process.env.PORT || '3000',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Common chunk for shared code
            common: {
              minChunks: 2,
              chunks: 'all',
              enforce: true,
              priority: 5,
            },
            // AI SDK chunk
            ai: {
              test: /[\\/]node_modules[\\/]ai[\\/]/,
              name: 'ai-vendor',
              chunks: 'all',
              priority: 15,
            },
            // Animation libraries chunk
            animation: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: 'animation-vendor',
              chunks: 'all',
              priority: 12,
            },
          },
        },
        // Enable module concatenation
        concatenateModules: true,
        // Minimize and use tree shaking
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
  // Redirects configuration
  async redirects() {
    return [];
  },
  // Rewrites configuration
  async rewrites() {
    return [];
  },

  // Turbopack configuration (using webpack for custom optimizations)
  turbopack: {},
};

export default nextConfig;
