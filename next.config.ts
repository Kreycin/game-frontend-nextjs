import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  sw: 'service-worker.js',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  // --- การแก้ไข ---
  // ย้าย importScripts เข้ามาไว้ใน workboxOptions
  workboxOptions: {
    importScripts: ['/firebase-messaging-sw.js'],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
