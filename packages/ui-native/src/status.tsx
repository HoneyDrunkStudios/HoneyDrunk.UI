import React from "react";
import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import { useTheme } from "./theme";
import { createStyles } from "./styles";

export interface BadgeProps extends Pick<
  ViewProps,
  "testID" | "accessibilityLabel"
> {
  /** Required text makes status understandable without color. */
  label: string;
}

/** Noninteractive, text-sized status. App policy determines its label. */
export function Badge({
  label,
  accessibilityLabel = label,
  testID,
}: BadgeProps) {
  const styles = createStyles(useTheme());
  return (
    <View testID={testID} style={styles.badge}>
      <Text
        selectable
        accessibilityLabel={accessibilityLabel}
        style={styles.muted}
      >
        {label}
      </Text>
    </View>
  );
}

export interface ProgressProps extends Pick<ViewProps, "testID"> {
  /** App-localized accessible name, also shown above the track. */
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Optional app-localized value description. Native readers otherwise announce the range. */
  valueText?: string;
}

/** Determinate, nonanimated progress. Values clamp to a finite, increasing range. */
export function Progress({
  label,
  value,
  min = 0,
  max = 100,
  valueText,
  testID,
}: ProgressProps) {
  if (![min, max, value].every(Number.isFinite) || max <= min) {
    throw new RangeError(
      "Progress requires finite values and max greater than min.",
    );
  }
  const theme = useTheme();
  const styles = createStyles(theme);
  const now = Math.min(max, Math.max(min, value));
  // Scale before subtraction so opposite finite extremes cannot overflow.
  const scale = Math.max(Math.abs(min), Math.abs(max), 1);
  const fraction = (now / scale - min / scale) / (max / scale - min / scale);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={valueText}
      accessibilityValue={{ min, max, now, text: valueText }}
      style={{ gap: theme.spacing.gap }}
    >
      <Text style={styles.text}>
        {label}
        {valueText ? `: ${valueText}` : ""}
      </Text>
      <View
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  );
}
