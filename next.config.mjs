// @ts-check
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  pageExtensions: ["page.ts", "page.tsx"],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/users/@:username",
      },
    ];
  },
};
export default config;
