/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  //TODO - High priority before launch - sort out cross origin opener policy errors with Google sign in and content security policy for app.
  //Also getting warnings about third party cookies to be deprecated in future versions. They are all coming from Google.
  async headers() {
    return [
      {
        source: "/login",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.firebaseapp.com https://*.google.com; frame-src 'self' https://*.firebaseapp.com https://*.google.com;",
          },
        ],
      },
      {
        source: "/register",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.firebaseapp.com https://*.google.com; frame-src 'self' https://*.firebaseapp.com https://*.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
