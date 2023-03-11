// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "pnpm",
  reporters: ["progress", "html"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  plugins: ["@stryker-mutator/jest-runner"],
};
export default config;
