import type { NextConfig } from "next";

function getSupabaseImageHost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = getSupabaseImageHost();
const isProduction = process.env.NODE_ENV === "production";
const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co"
].join(" ");

const scriptSrc = isProduction ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src " + connectSrc,
  "media-src 'self' blob: https:",
  "frame-src 'self' https://www.google.com https://maps.google.com"
].join("; ");

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site"
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  typescript: {
    // CI/local type safety is handled by `npm run typecheck`.
    // This avoids Windows EPERM spawn issues during Next's internal typecheck step.
    ignoreBuildErrors: true
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost
            }
          ]
        : [])
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive"
          },
          {
            key: "Cache-Control",
            value: "no-store"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
