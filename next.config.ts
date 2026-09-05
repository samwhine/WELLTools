import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Deliberately NOT setting Cross-Origin-Opener-Policy / Cross-Origin-
  // Embedder-Policy here. The FFmpeg.wasm build this project loads
  // (@ffmpeg/core, single-threaded) doesn't need cross-origin isolation —
  // only the multi-threaded @ffmpeg/core-mt build does, via SharedArrayBuffer.
  // A blanket `require-corp` COEP header was here in an earlier draft and
  // got removed: it applies to every route, and would silently break any
  // future external image/embed/script that doesn't send a matching CORP
  // header, for a feature this build doesn't even use yet. If you upgrade
  // to core-mt for faster encoding later, add both headers back here first.
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
