// Theme utility for accessing centralized CSS custom property values in charts, WebGL and canvas

export const THEME = {
  background: "#101110",
  foreground: "#eeeee8",
  surface: "#181a18",
  surfaceElevated: "#202320",
  surfaceMuted: "#252825",
  textPrimary: "#eeeee8",
  textSecondary: "#a4a79f",
  textMuted: "#777c74",
  border: "#343832",
  borderSubtle: "#292d29",
  borderStrong: "#4b514a",
  accent: "#c76b45",
  accentHover: "#dc8057",
  pollutionLow: "#86a98a",
  pollutionModerate: "#c2b06c",
  pollutionHigh: "#d58a50",
  pollutionSevere: "#b95342",
  dataWeather: "#82b8c5",
  dataImprovement: "#86a98a",
  dataNeutral: "#a4a79f",
};

export function getCssVariable(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

export function getPollutionColor(aqiOrVal: number, pollutant: string = "AQI"): string {
  if (pollutant === "AQI") {
    if (aqiOrVal <= 50) return THEME.pollutionLow;
    if (aqiOrVal <= 100) return "#a6bf82";
    if (aqiOrVal <= 200) return THEME.pollutionModerate;
    if (aqiOrVal <= 300) return THEME.pollutionHigh;
    if (aqiOrVal <= 400) return "#cc6a4c";
    return THEME.pollutionSevere;
  }
  // PM2.5
  if (aqiOrVal <= 30) return THEME.pollutionLow;
  if (aqiOrVal <= 60) return "#a6bf82";
  if (aqiOrVal <= 90) return THEME.pollutionModerate;
  if (aqiOrVal <= 120) return THEME.pollutionHigh;
  return THEME.pollutionSevere;
}
