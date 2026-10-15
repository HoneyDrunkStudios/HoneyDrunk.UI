const expoConfig = require("eslint-config-expo/flat");
const packageBoundaries = require("./scripts/eslint/package-boundaries.cjs");

module.exports = [
  ...expoConfig,
  { ignores: ["node_modules/**"] },
  {
    files: ["packages/*/src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: { architecture: { rules: { "package-boundaries": packageBoundaries } } },
    rules: { "architecture/package-boundaries": "error" },
  },
];
