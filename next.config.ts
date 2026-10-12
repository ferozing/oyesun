import type { NextConfig } from "next";

// The app itself (FastAPI on Cloud Run) is served under /app on this same
// domain, so the landing page, the signup flow and the app all share one
// origin. That is what makes the signed-in handoff a sessionStorage write
// rather than a token in a URL, and it means there is no CORS anywhere.
//
// APP_ORIGIN is the Cloud Run URL. It is a server-side variable on purpose:
// the browser only ever sees /app.
const appOrigin = (process.env.APP_ORIGIN ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  rewrites() {
    // Without APP_ORIGIN set, /app simply 404s instead of the build failing —
    // same spirit as the API routes answering "the waitlist opens very soon"
    // until Supabase is wired up.
    if (!appOrigin) return [];
    return [
      { source: "/app", destination: `${appOrigin}/` },
      { source: "/app/:path*", destination: `${appOrigin}/:path*` },
    ];
  },
};

export default nextConfig;
