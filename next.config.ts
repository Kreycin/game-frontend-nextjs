import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  sw: 'service-worker.js',
  // Disable aggressive caching for dynamic content (CMS data)
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  // Import Firebase Messaging SW
  workboxOptions: {
    importScripts: ['/firebase-messaging-sw.js'],
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
