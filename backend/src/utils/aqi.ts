// Indian National Air Quality Index (NAQI) Breakpoint Standards (CPCB)
// & Revised 2024 US EPA PM2.5 Standards

interface Breakpoint {
  lowC: number;
  highC: number;
  lowI: number;
  highI: number;
}

// CPCB Contiguous Breakpoint Tables
const PM25_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 30, lowI: 0, highI: 50 },
  { lowC: 30, highC: 60, lowI: 51, highI: 100 },
  { lowC: 60, highC: 90, lowI: 101, highI: 200 },
  { lowC: 90, highC: 120, lowI: 201, highI: 300 },
  { lowC: 120, highC: 250, lowI: 301, highI: 400 },
  { lowC: 250, highC: 500, lowI: 401, highI: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 50, lowI: 0, highI: 50 },
  { lowC: 50, highC: 100, lowI: 51, highI: 100 },
  { lowC: 100, highC: 250, lowI: 101, highI: 200 },
  { lowC: 250, highC: 350, lowI: 201, highI: 300 },
  { lowC: 350, highC: 430, lowI: 301, highI: 400 },
  { lowC: 430, highC: 600, lowI: 401, highI: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 40, lowI: 0, highI: 50 },
  { lowC: 40, highC: 80, lowI: 51, highI: 100 },
  { lowC: 80, highC: 180, lowI: 101, highI: 200 },
  { lowC: 180, highC: 280, lowI: 201, highI: 300 },
  { lowC: 280, highC: 400, lowI: 301, highI: 400 },
  { lowC: 400, highC: 600, lowI: 401, highI: 500 },
];

const SO2_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 40, lowI: 0, highI: 50 },
  { lowC: 40, highC: 80, lowI: 51, highI: 100 },
  { lowC: 80, highC: 380, lowI: 101, highI: 200 },
  { lowC: 380, highC: 800, lowI: 201, highI: 300 },
  { lowC: 800, highC: 1600, lowI: 301, highI: 400 },
  { lowC: 1600, highC: 2000, lowI: 401, highI: 500 },
];

const CO_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 1.0, lowI: 0, highI: 50 },
  { lowC: 1.0, highC: 2.0, lowI: 51, highI: 100 },
  { lowC: 2.0, highC: 10.0, lowI: 101, highI: 200 },
  { lowC: 10.0, highC: 17.0, lowI: 201, highI: 300 },
  { lowC: 17.0, highC: 34.0, lowI: 301, highI: 400 },
  { lowC: 34.0, highC: 50.0, lowI: 401, highI: 500 },
];

const O3_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 50, lowI: 0, highI: 50 },
  { lowC: 50, highC: 100, lowI: 51, highI: 100 },
  { lowC: 100, highC: 168, lowI: 101, highI: 200 },
  { lowC: 168, highC: 208, lowI: 201, highI: 300 },
  { lowC: 208, highC: 748, lowI: 301, highI: 400 },
  { lowC: 748, highC: 1000, lowI: 401, highI: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration == null || isNaN(concentration) || concentration < 0) return 0;
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (concentration <= bp.highC) {
      const c = Math.max(bp.lowC, concentration);
      return Math.round(
        ((bp.highI - bp.lowI) / (bp.highC - bp.lowC)) * (c - bp.lowC) + bp.lowI
      );
    }
  }
  return 500; // Extreme cap
}

export function calculateAQI(pollutants: {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}): { aqi: number; category: string; dominantPollutant: string } {
  const subIndices: { pollutant: string; val: number }[] = [];

  if (pollutants.pm25 !== undefined && !isNaN(pollutants.pm25) && pollutants.pm25 !== null) {
    subIndices.push({ pollutant: "PM2.5", val: calculateSubIndex(pollutants.pm25, PM25_BREAKPOINTS) });
  }
  if (pollutants.pm10 !== undefined && !isNaN(pollutants.pm10) && pollutants.pm10 !== null) {
    subIndices.push({ pollutant: "PM10", val: calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS) });
  }
  if (pollutants.no2 !== undefined && !isNaN(pollutants.no2) && pollutants.no2 !== null) {
    subIndices.push({ pollutant: "NO2", val: calculateSubIndex(pollutants.no2, NO2_BREAKPOINTS) });
  }
  if (pollutants.so2 !== undefined && !isNaN(pollutants.so2) && pollutants.so2 !== null) {
    subIndices.push({ pollutant: "SO2", val: calculateSubIndex(pollutants.so2, SO2_BREAKPOINTS) });
  }
  if (pollutants.co !== undefined && !isNaN(pollutants.co) && pollutants.co !== null) {
    subIndices.push({ pollutant: "CO", val: calculateSubIndex(pollutants.co, CO_BREAKPOINTS) });
  }
  if (pollutants.o3 !== undefined && !isNaN(pollutants.o3) && pollutants.o3 !== null) {
    subIndices.push({ pollutant: "O3", val: calculateSubIndex(pollutants.o3, O3_BREAKPOINTS) });
  }

  if (subIndices.length === 0) {
    return { aqi: 0, category: "Unknown", dominantPollutant: "None" };
  }

  subIndices.sort((a, b) => b.val - a.val);
  const maxSub = subIndices[0];

  let category = "Good";
  if (maxSub.val > 400) category = "Severe";
  else if (maxSub.val > 300) category = "Very Poor";
  else if (maxSub.val > 200) category = "Poor";
  else if (maxSub.val > 100) category = "Moderate";
  else if (maxSub.val > 50) category = "Satisfactory";

  return {
    aqi: maxSub.val,
    category,
    dominantPollutant: maxSub.pollutant,
  };
}

export function calculateUSAQI(pm25: number): { usAqi: number; usCategory: string } {
  if (pm25 == null || isNaN(pm25) || pm25 < 0) {
    return { usAqi: 0, usCategory: "Good" };
  }

  // 2024 Revised US EPA PM2.5 Breakpoints:
  // Good: 0.0 - 9.0 (0 - 50)
  // Moderate: 9.1 - 35.4 (51 - 100)
  // Unhealthy for Sensitive Groups: 35.5 - 55.4 (101 - 150)
  // Unhealthy: 55.5 - 125.4 (151 - 200)
  // Very Unhealthy: 125.5 - 225.4 (201 - 300)
  // Hazardous: 225.5 - 500.4 (301 - 500)
  let aqi = 0;
  if (pm25 <= 9.0) {
    aqi = Math.round((50 / 9.0) * pm25);
  } else if (pm25 <= 35.4) {
    aqi = Math.round(51 + ((100 - 51) / (35.4 - 9.1)) * (pm25 - 9.1));
  } else if (pm25 <= 55.4) {
    aqi = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
  } else if (pm25 <= 125.4) {
    aqi = Math.round(151 + ((200 - 151) / (125.4 - 55.5)) * (pm25 - 55.5));
  } else if (pm25 <= 225.4) {
    aqi = Math.round(201 + ((300 - 201) / (225.4 - 125.5)) * (pm25 - 125.5));
  } else {
    aqi = Math.round(301 + ((500 - 301) / (500.4 - 225.5)) * (Math.min(500.4, pm25) - 225.5));
  }

  let usCategory = "Good";
  if (aqi > 300) usCategory = "Hazardous";
  else if (aqi > 200) usCategory = "Very Unhealthy";
  else if (aqi > 150) usCategory = "Unhealthy";
  else if (aqi > 100) usCategory = "Unhealthy for Sensitive Groups";
  else if (aqi > 50) usCategory = "Moderate";

  return { usAqi: aqi, usCategory };
}

export function convertUSAQIToPM25(aqi: number): number {
  if (aqi <= 0 || isNaN(aqi)) return 0;
  if (aqi <= 50) {
    return Number(((aqi / 50) * 9.0).toFixed(1));
  } else if (aqi <= 100) {
    return Number((9.1 + ((aqi - 51) / (100 - 51)) * (35.4 - 9.1)).toFixed(1));
  } else if (aqi <= 150) {
    return Number((35.5 + ((aqi - 101) / (150 - 101)) * (55.4 - 35.5)).toFixed(1));
  } else if (aqi <= 200) {
    return Number((55.5 + ((aqi - 151) / (200 - 151)) * (125.4 - 55.5)).toFixed(1));
  } else if (aqi <= 300) {
    return Number((125.5 + ((aqi - 201) / (300 - 201)) * (225.4 - 125.5)).toFixed(1));
  } else {
    return Number((225.5 + ((Math.min(500, aqi) - 301) / (500 - 301)) * (500.4 - 225.5)).toFixed(1));
  }
}

export function convertUSAQIToPM10(aqi: number): number {
  if (aqi <= 0 || isNaN(aqi)) return 0;
  if (aqi <= 50) {
    return Number(((aqi / 50) * 54.0).toFixed(1));
  } else if (aqi <= 100) {
    return Number((55.0 + ((aqi - 51) / (100 - 51)) * (154.0 - 55.0)).toFixed(1));
  } else if (aqi <= 150) {
    return Number((155.0 + ((aqi - 101) / (150 - 101)) * (254.0 - 155.0)).toFixed(1));
  } else if (aqi <= 200) {
    return Number((255.0 + ((aqi - 151) / (200 - 151)) * (354.0 - 255.0)).toFixed(1));
  } else if (aqi <= 300) {
    return Number((355.0 + ((aqi - 201) / (300 - 201)) * (424.0 - 355.0)).toFixed(1));
  } else {
    return Number((425.0 + ((Math.min(500, aqi) - 301) / (500 - 301)) * (604.0 - 425.0)).toFixed(1));
  }
}
