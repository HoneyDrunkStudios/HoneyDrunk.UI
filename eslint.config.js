const expoConfig = require("eslint-config-expo/flat");
const packageBoundaries = require("./scripts/eslint/package-boundaries.cjs");

module.exports = [
  // Expo's TypeScript preset currently matches only .ts/.tsx. Keep its parser
  // and checks for explicit ESM/CommonJS TypeScript source files as well.
  ...expoConfig.map((config) => config.files?.includes("**/*.ts")
    ? { ...config, files: [...config.files, "**/*.mts", "**/*.cts"] }
    : config),
  { ignores: ["node_modules/**"] },
  {
    files: ["packages/*/src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
    plugins: { architecture: { rules: { "package-boundaries": packageBoundaries } } },
    rules: { "architecture/package-boundaries": "error" },
  },
];
