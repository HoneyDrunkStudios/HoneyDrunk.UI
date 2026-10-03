import test from "node:test";
import { strict as assert } from "node:assert";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const Module = require("node:module");
const load = Module._load;
const hostViews = [];
const platform = { OS: "android" };
// Capture props at the native host boundary. This does not emulate a native
// renderer or prove VoiceOver/TalkBack behavior; device acceptance stays separate.
const nativeHost = {
  Platform: platform,
  View: ({ children, ...props }) => {
    hostViews.push(props);
    return React.createElement("div", null, children);
  },
  Text: ({ children }) => React.createElement("span", null, children),
};
Module._load = function (name, ...rest) {
  return name === "react-native" ? nativeHost : load.call(this, name, ...rest);
};
for (const extension of [".ts", ".tsx"])
  require.extensions[extension] = (module, file) => {
    const output = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    module._compile(output, file);
  };
const { ThemeProvider } = require("../packages/ui-native/src/theme.tsx");
const { Progress } = require("../packages/ui-native/src/status.tsx");
const { dark } = require("./fixtures/themes.ts");

for (const os of ["android", "ios"]) {
  test(`progress sends a bounded percentage and localized value to ${os}`, () => {
    platform.OS = os;
    for (const [min, max, value, expected] of [
      [0.1, 0.9, 0.5, 50],
      [1e16, 1e16 + 8, 1e16 + 2, 25],
      [-Number.MAX_VALUE, Number.MAX_VALUE, 0, 50],
      [10, 50, -10, 0],
      [10, 50, 60, 100],
    ]) {
      hostViews.length = 0;
      renderToStaticMarkup(
        React.createElement(
          ThemeProvider,
          { theme: dark },
          React.createElement(Progress, {
            label: "Completion",
            min,
            max,
            value,
            valueText: "Localized value",
          }),
        ),
      );
      const host = hostViews.find(
        (props) => props.accessibilityRole === "progressbar",
      );
      assert.equal(host.accessible, true);
      assert.equal(host.accessibilityLabel, "Completion");
      assert.deepEqual(host.accessibilityValue, {
        min: 0,
        max: 100,
        now: expected,
        text: "Localized value",
      });
      // ARIA aliases take priority inside RN View; they must agree with the native value.
      assert.equal(host["aria-valuemin"], 0);
      assert.equal(host["aria-valuemax"], 100);
      assert.equal(host["aria-valuenow"], expected);
      assert.equal(host["aria-valuetext"], "Localized value");
    }
  });
}
