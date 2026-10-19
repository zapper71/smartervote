/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // /races was Huntsville's ballot page. Huntsville's ballot now lives
      // with every other municipality's at /municipalities/huntsville, and
      // /races itself sends people to the home-page finder.
      { source: "/races", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No third-party trackers on this site, so lock the browser down.
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
