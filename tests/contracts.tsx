import React from "react";
import type { Theme } from "@honeydrunk/ui-tokens";
import { resolveTheme } from "@honeydrunk/ui-tokens";
import {
  ThemeProvider,
  Button,
  Label,
  Card,
  Input,
  Loading,
  Notice,
  Progress,
  Badge,
} from "@honeydrunk/ui-native";

// The complete 0.1.0 theme shape, with no new optional tokens.
const legacy: Theme = {
  colors: {
    text: "black",
    muted: "gray",
    background: "white",
    surface: "white",
    primary: "blue",
    onPrimary: "white",
    border: "gray",
    accent: "gold",
    danger: "red",
    input: "white",
  },
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
  shape: { panelRadius: 18, controlRadius: 12, borderWidth: 1 },
  controls: { minHeight: 48, pressedOpacity: 0.8, disabledOpacity: 0.6 },
};
export const legacyConsumer = (
  <ThemeProvider theme={legacy}>
    <Card>
      <Label>Legacy</Label>
      <Button title="Save" onPress={() => {}} disabled secondary />
      <Input editable={false} value="Ada" />
      <Loading label="Loading" />
      <Notice>Error</Notice>
      <Progress label="Progress" value={1} />
      <Badge label="Available" />
    </Card>
  </ThemeProvider>
);
export const resolvedFocus: string = resolveTheme(legacy).colors.focus;
// @ts-expect-error Progress requires an accessible label.
export const unnamedProgress = <Progress value={10} />;
// @ts-expect-error Shared progress accepts a numeric display value, not domain state.
export const invalidProgress = <Progress label="Progress" value="10" />;
// @ts-expect-error Button callbacks are required.
export const invalidButton = <Button title="Save" />;
