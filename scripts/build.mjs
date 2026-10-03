import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";

// A real consumer bundle catches package exports and RN Web adapter resolution.
await mkdir("artifacts/web", { recursive: true });
await build({
  entryPoints: ["tests/web/fixture.tsx"],
  outfile: "artifacts/web/fixture.js",
  bundle: true,
  platform: "browser",
  alias: { "react-native": "react-native-web" },
  define: { "process.env.NODE_ENV": '"production"' },
  sourcemap: true,
});
await copyFile("tests/web/index.html", "artifacts/web/index.html");
