/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  //TODO - High priority before launch - sort out cross origin policies
  // async headers() {
  //   return [
  //     {
  //       source: '/login',
  //       headers: [
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin-allow-popups',
  //         },
  //         {
  //           key: 'Cross-Origin-Embedder-Policy',
  //           value: 'unsafe-none',
  //         },
  //         {
  //           key: 'Content-Security-Policy',
  //           value:
  //             "frame-ancestors 'self' https://*.firebaseapp.com https://*.google.com; frame-src 'self' https://*.firebaseapp.com https://*.google.com;",
  //         },
  //       ],
  //     },
  //     {
  //       source: '/register',
  //       headers: [
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin-allow-popups',
  //         },
  //         {
  //           key: 'Cross-Origin-Embedder-Policy',
  //           value: 'unsafe-none',
  //         },
  //         {
  //           key: 'Content-Security-Policy',
  //           value:
  //             "frame-ancestors 'self' https://*.firebaseapp.com https://*.google.com; frame-src 'self' https://*.firebaseapp.com https://*.google.com;",
  //         },
  //       ],
  //     },
  //   ];
  // },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://dropbearcare.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
