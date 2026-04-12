import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  sw: "sw.js",
  workboxOptions: {
    disableDevLogs: true,
  },
  // Disable PWA in dev to avoid caching headaches
  disable: process.env.NODE_ENV === "development",
});

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // This silences the error about using webpack plugins (like next-pwa) 
    // while Turbopack is enabled by default in Next.js 16.
  },
};

export default withSentryConfig(
  withNextIntl(withPWA(nextConfig)),
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
  }
);
