import { foundation, type Theme } from "@honeydrunk/ui-tokens";

/** Generic test fixtures, never an implicit theme or a product palette. */
export const dark: Theme = {
  ...foundation,
  controls: { ...foundation.controls, disabledOpacity: 0.75 },
  colors: {
    text: "#F4F4F5",
    muted: "#C4C4C8",
    background: "#151518",
    surface: "#242428",
    primary: "#A8C7FF",
    onPrimary: "#122038",
    border: "#81818A",
    accent: "#D6C6A1",
    danger: "#FFB4AB",
    input: "#1C1C20",
    focus: "#D6C6A1",
    progressTrack: "#44444B",
  },
};
export const light: Theme = {
  ...foundation,
  controls: { ...foundation.controls, disabledOpacity: 0.75 },
  colors: {
    text: "#18181B",
    muted: "#52525B",
    background: "#FFFFFF",
    surface: "#F4F4F5",
    primary: "#001B48",
    onPrimary: "#FFFFFF",
    border: "#71717A",
    accent: "#654B17",
    danger: "#A51B22",
    input: "#FFFFFF",
    focus: "#174EA6",
    progressTrack: "#E4E4E7",
  },
};
