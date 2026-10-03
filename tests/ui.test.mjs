import test from "node:test";
import { strict as assert } from "node:assert";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
// Render native primitives through the existing web adapter, without a new test dependency.
const nativeWeb = require("react-native-web");
const Module = require("node:module");
const load = Module._load;
Module._load = function (name, ...rest) {
  return name === "react-native" ? nativeWeb : load.call(this, name, ...rest);
};
for (const extension of [".ts", ".tsx"])
  require.extensions[extension] = (module, file) => {
    const source = require("node:fs").readFileSync(file, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    module._compile(output, file);
  };
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const {
  foundation,
  resolveTheme,
} = require("../packages/ui-tokens/src/index.ts");
const {
  ThemeProvider,
  Button,
  Card,
  Input,
  Label,
  Notice,
  createStyles,
  buttonAppearance,
  focusAppearance,
  Badge,
  Progress,
  Loading,
} = require("../packages/ui-native/src/index.tsx");
const darkFixture = {
  ...foundation,
  colors: {
    text: "#EDF1FF",
    muted: "#B7C3E0",
    background: "#0D1225",
    surface: "#18213B",
    primary: "#8BE9E1",
    onPrimary: "#0D1225",
    border: "#52618B",
    accent: "#FFD780",
    danger: "#FFB4C2",
    input: "#10182E",
  },
};
const alternate = {
  ...foundation,
  colors: {
    text: "#17221A",
    muted: "#405347",
    background: "#FFFFFF",
    surface: "#F1F7F2",
    primary: "#23623E",
    onPrimary: "#FFFFFF",
    border: "#657B6C",
    accent: "#765321",
    danger: "#9A1F30",
    input: "#FFFFFF",
  },
};
const render = (theme, child) =>
  renderToStaticMarkup(React.createElement(ThemeProvider, { theme }, child));
test("native primitives require an explicit app theme", () => {
  assert.throws(
    () => renderToStaticMarkup(React.createElement(Label, null, "Hello")),
    /app-supplied ThemeProvider/,
  );
});
test("two app themes render independently and preserve input accessibility and values", () => {
  for (const theme of [darkFixture, alternate]) {
    const html = render(
      theme,
      React.createElement(
        Card,
        { accessibilityLabel: "Profile" },
        React.createElement(Input, {
          accessibilityLabel: "Name",
          value: "Ada",
          editable: false,
        }),
        React.createElement(Label, null, "Hello"),
      ),
    );
    assert.match(html, /aria-label="Profile"/);
    assert.match(html, /aria-label="Name"/);
    assert.match(html, /value="Ada"/);
    assert.match(html, /read[oO]nly/);
    assert.equal(createStyles(theme).text.color, theme.colors.text);
    assert.equal(
      createStyles(theme).card.backgroundColor,
      theme.colors.surface,
    );
  }
  assert.notEqual(
    render(darkFixture, React.createElement(Label, null, "Hello")),
    render(alternate, React.createElement(Label, null, "Hello")),
  );
});
test("disabled actions retain semantics, touch target and state precedence in each theme", () => {
  for (const theme of [darkFixture, alternate]) {
    const html = render(
      theme,
      React.createElement(Button, {
        title: "Save",
        onPress: () => assert.fail("disabled action fired"),
        disabled: true,
      }),
    );
    assert.match(html, /aria-disabled="true"/);
    assert.match(html, /role="button"/);
    assert.match(html, /Save/);
    assert.ok(theme.controls.minHeight >= 48);
    assert.equal(
      buttonAppearance(theme, false, true, true).opacity,
      theme.controls.disabledOpacity,
    );
    assert.equal(
      buttonAppearance(theme, true, false, true).color,
      theme.colors.primary,
    );
  }
});
test("error notices expose a polite announcement", () => {
  assert.match(
    render(alternate, React.createElement(Notice, null, "Try again")),
    /aria-live="polite"/,
  );
});
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
test("Dark fixture body, muted, error and button text meet AA contrast", () => {
  const c = darkFixture.colors;
  for (const [fg, bg] of [
    [c.text, c.background],
    [c.text, c.surface],
    [c.muted, c.surface],
    [c.danger, c.surface],
    [c.onPrimary, c.primary],
    [c.text, c.input],
  ]) {
    const a = luminance(fg),
      b = luminance(bg);
    assert.ok(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
      fg + " on " + bg,
    );
  }
});

test("legacy themes resolve optional tokens without mutation or shared state", () => {
  const legacy = {
    ...alternate,
    typography: {
      titleSize: 28,
      subtitleSize: 20,
      bodySize: 16,
      captionSize: 14,
      bodyLineHeight: 24,
      captionLineHeight: 21,
      titleWeight: "700",
    },
    spacing: { panel: 20, gap: 12, control: 12 },
    controls: { minHeight: 48, pressedOpacity: 0.8, disabledOpacity: 0.6 },
  };
  const before = JSON.stringify(legacy);
  const resolved = resolveTheme(legacy);
  assert.equal(resolved.colors.focus, legacy.colors.primary);
  assert.equal(resolved.controls.minWidth, 48);
  assert.equal(resolved.spacing.buttonHorizontal, 18);
  assert.equal(resolved.typography.buttonWeight, "600");
  resolved.colors.focus = "red";
  assert.equal(JSON.stringify(legacy), before);
  assert.equal(resolveTheme(legacy).colors.focus, legacy.colors.primary);
});

test("custom tokens control focus, typography, and progress geometry", () => {
  const custom = {
    ...alternate,
    colors: { ...alternate.colors, focus: "purple", progressTrack: "gray" },
    controls: { ...foundation.controls, focusWidth: 3, progressHeight: 10 },
    typography: {
      ...foundation.typography,
      buttonWeight: "700",
      subtitleWeight: "500",
    },
    spacing: { ...foundation.spacing, buttonHorizontal: 24 },
  };
  assert.equal(focusAppearance(custom, true).outlineWidth, 3);
  assert.equal(focusAppearance(custom, false).outlineWidth, 0);
  assert.equal(focusAppearance(custom, true).outlineColor, "purple");
  assert.equal(createStyles(custom).progressTrack.height, 10);
  assert.equal(createStyles(custom).progressTrack.backgroundColor, "gray");
  assert.equal(createStyles(custom).buttonText.fontWeight, "700");
  assert.equal(createStyles(custom).subtitle.fontWeight, "500");
  assert.equal(createStyles(custom).button.paddingHorizontal, 24);
});

test("busy buttons preserve their name and expose disabled and busy state", () => {
  const html = render(
    alternate,
    React.createElement(Button, {
      title: "Save",
      loading: true,
      onPress: () => assert.fail(),
    }),
  );
  assert.match(html, /aria-label="Save"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-disabled="true"/);
});

test("Label forwards heading and font-scaling host props", () => {
  const html = render(
    alternate,
    React.createElement(
      Label,
      { accessibilityRole: "header", nativeID: "heading" },
      "Section",
    ),
  );
  assert.match(html, /role="heading"/);
  assert.match(html, /id="heading"/);
});

test("Input error is visible, politely announced and associated on web", () => {
  const html = render(
    alternate,
    React.createElement(Input, {
      accessibilityLabel: "Name",
      defaultValue: "Ada",
      error: "Name needs attention",
    }),
  );
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="([^"]+)"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Name needs attention/);
  assert.match(html, /value="Ada"/);
});

test("badge content conveys status without color or interaction semantics", () => {
  const html = render(
    alternate,
    React.createElement(Badge, { label: "Available" }),
  );
  assert.match(html, /Available/);
  assert.match(html, /aria-label="Available"/);
  assert.doesNotMatch(html, /role="button"|tabindex=/);
});

for (const [value, now, width] of [
  [-10, 10, 0],
  [20, 20, 25],
  [50, 50, 100],
  [60, 50, 100],
]) {
  test(`progress clamps ${value} to its accessible and visual range`, () => {
    const html = render(
      alternate,
      React.createElement(Progress, {
        label: "Completion",
        min: 10,
        max: 50,
        value,
      }),
    );
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-label="Completion"/);
    assert.match(html, new RegExp(`aria-valuenow="${now}"`));
    assert.match(html, /aria-valuemin="10"/);
    assert.match(html, /aria-valuemax="50"/);
    assert.match(html, new RegExp(`width:${width}%`));
    assert.match(html, /aria-hidden="true"/);
  });
}

test("progress supports localized value text and finite extreme ranges", () => {
  const html = render(
    alternate,
    React.createElement(Progress, {
      label: "Completion",
      value: 0,
      min: -Number.MAX_VALUE,
      max: Number.MAX_VALUE,
      valueText: "Half complete",
    }),
  );
  assert.match(html, /aria-valuetext="Half complete"/);
  assert.match(html, /width:50%/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

for (const [min, max, value, percent] of [
  [1e16, 1e16 + 8, 1e16 + 2, 25],
  [-1e16 - 8, -1e16, -1e16 - 2, 75],
  [0, Number.MIN_VALUE * 4, Number.MIN_VALUE, 25],
  [0.1, 0.9, 0.5, 50],
]) {
  test(`progress preserves the fraction in the range ${min} to ${max}`, () => {
    const html = render(
      alternate,
      React.createElement(Progress, { label: "Completion", min, max, value }),
    );
    assert.match(html, new RegExp(`width:${percent}%`));
    assert.match(html, new RegExp(`aria-valuenow="${value}"`));
    assert.doesNotMatch(html, /NaN|Infinity/);
  });
}

for (const props of [
  { value: NaN },
  { value: Infinity },
  { value: 1, min: 1, max: 1 },
  { value: 1, min: 10, max: 0 },
  { value: 1, max: Infinity },
]) {
  test(`progress rejects invalid range ${JSON.stringify(props)}`, () => {
    assert.throws(
      () =>
        render(
          alternate,
          React.createElement(Progress, { label: "Completion", ...props }),
        ),
      RangeError,
    );
  });
}

test("loading starts with a named static busy fallback for reduced motion and SSR", () => {
  const html = render(
    alternate,
    React.createElement(Loading, { label: "Loading information" }),
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /Loading information/);
});

test("both generic fixture themes meet text and essential boundary contrast", () => {
  const { dark, light } = require("./fixtures/themes.ts");
  for (const { colors: c } of [dark, light]) {
    const pairs = [
      [c.text, c.surface, 4.5],
      [c.muted, c.surface, 4.5],
      [c.muted, c.input, 4.5],
      [c.danger, c.surface, 4.5],
      [c.onPrimary, c.primary, 4.5],
      [c.primary, c.background, 4.5],
      [c.border, c.surface, 3],
      [c.focus, c.background, 3],
      [c.focus, c.surface, 3],
      [c.border, c.input, 3],
      [c.primary, c.progressTrack, 3],
      [c.danger, c.input, 3],
    ];
    for (const [fg, bg, minimum] of pairs) {
      const a = luminance(fg),
        b = luminance(bg);
      assert.ok(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= minimum,
        `${fg} on ${bg}`,
      );
    }
  }
});

test("fixture disabled text remains readable after opacity compositing", () => {
  const { dark, light } = require("./fixtures/themes.ts");
  const blend = (foreground, background, opacity) =>
    "#" +
    [1, 3, 5]
      .map((offset) =>
        Math.round(
          parseInt(foreground.slice(offset, offset + 2), 16) * opacity +
            parseInt(background.slice(offset, offset + 2), 16) * (1 - opacity),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  for (const { colors: c, controls } of [dark, light]) {
    const fg = luminance(
      blend(c.onPrimary, c.surface, controls.disabledOpacity),
    );
    const bg = luminance(blend(c.primary, c.surface, controls.disabledOpacity));
    assert.ok((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) >= 4.5);
  }
});
