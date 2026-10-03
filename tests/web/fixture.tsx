import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { View } from "react-native";
import {
  ThemeProvider,
  useTheme,
  Label,
  Card,
  Button,
  Input,
  Loading,
  Notice,
  Badge,
  Progress,
  createStyles,
} from "@honeydrunk/ui-native";
import { dark, light } from "../fixtures/themes";

function Controls({ toggleTheme }: { toggleTheme(): void }) {
  const theme = useTheme();
  const direction =
    new URLSearchParams(window.location.search).get("dir") === "rtl"
      ? "rtl"
      : "ltr";
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  return (
    <View
      style={{
        direction,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.panel,
        gap: theme.spacing.gap,
      }}
    >
      <Label accessibilityRole="header" style={createStyles(theme).title}>
        UI controls
      </Label>
      <Card testID="surface">
        <Button title="Activate" onPress={() => setCount((n) => n + 1)} />
        <Label testID="count">Activations: {count}</Label>
        <Button
          title="Disabled"
          disabled
          onPress={() => setCount((n) => n + 1)}
        />
        <Button
          title="Busy action"
          loading={loading}
          onPress={() => setCount((n) => n + 1)}
        />
        <Button
          title="Toggle busy"
          secondary
          onPress={() => setLoading((n) => !n)}
        />
        <Button title="Switch theme" secondary onPress={toggleTheme} />
        <Input
          accessibilityLabel="Name"
          defaultValue="Ada"
          error={error ? "Name needs attention" : undefined}
          testID="name"
        />
        <Input
          accessibilityLabel="Read only"
          value="Protected"
          editable={false}
        />
        <Button
          title="Toggle error"
          secondary
          onPress={() => setError((n) => !n)}
        />
        <Notice>Review the entered information</Notice>
        <Badge label="Available" />
        <Progress
          label="Completion"
          value={25}
          valueText="25 percent"
          testID="progress"
        />
        <Loading label="Loading information" />
        <Button
          title="A long action label that must wrap at large text sizes and on narrow screens"
          onPress={() => {}}
        />
      </Card>
    </View>
  );
}
function Fixture() {
  const [isDark, setDark] = useState(true);
  const base = isDark ? dark : light;
  const scale =
    new URLSearchParams(window.location.search).get("scale") === "2" ? 2 : 1;
  const theme = {
    ...base,
    typography: {
      ...base.typography,
      titleSize: base.typography.titleSize * scale,
      subtitleSize: base.typography.subtitleSize * scale,
      bodySize: base.typography.bodySize * scale,
      captionSize: base.typography.captionSize * scale,
      bodyLineHeight: base.typography.bodyLineHeight * scale,
      captionLineHeight: base.typography.captionLineHeight * scale,
    },
  };
  return (
    <ThemeProvider theme={theme}>
      <Controls toggleTheme={() => setDark((n) => !n)} />
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
