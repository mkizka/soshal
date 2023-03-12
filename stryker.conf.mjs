// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "pnpm",
  reporters: ["progress", "html", "json"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  incremental: true,
  mutate: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.page.ts",
    "!src/**/*.spec.ts",
    "!src/**/fixtures/**/*.ts",
    "!src/**/__mocks__/**/*.ts",
  ],
  plugins: ["@stryker-mutator/jest-runner"],
};
export default config;
