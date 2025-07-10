/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import createMDX from "@next/mdx";
import createNextIntlPlugin from 'next-intl/plugin';
import "./src/env.js";

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import("next").NextConfig} */
const config = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shzddu7ar2.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 5 * 60,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withMDX = createMDX();

export default withNextIntl(withMDX(config));
