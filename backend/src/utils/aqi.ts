// Indian National Air Quality Index (NAQI) Breakpoint Standards (CPCB)

interface Breakpoint {
  lowC: number;
  highC: number;
  lowI: number;
  highI: number;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 30, lowI: 0, highI: 50 },
  { lowC: 31, highC: 60, lowI: 51, highI: 100 },
  { lowC: 61, highC: 90, lowI: 101, highI: 200 },
  { lowC: 91, highC: 120, lowI: 201, highI: 300 },
  { lowC: 121, highC: 250, lowI: 301, highI: 400 },
  { lowC: 251, highC: 500, lowI: 401, highI: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 50, lowI: 0, highI: 50 },
  { lowC: 51, highC: 100, lowI: 51, highI: 100 },
  { lowC: 101, highC: 250, lowI: 101, highI: 200 },
  { lowC: 251, highC: 350, lowI: 201, highI: 300 },
  { lowC: 351, highC: 430, lowI: 301, highI: 400 },
  { lowC: 431, highC: 600, lowI: 401, highI: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { lowC: 0, highC: 40, lowI: 0, highI: 50 },
  { lowC: 41, highC: 80, lowI: 51, highI: 100 },
  { lowC: 81, highC: 180, lowI: 101, highI: 200 },
  { lowC: 181, highC: 280, lowI: 201, highI: 300 },
  { lowC: 281, highC: 400, lowI: 301, highI: 400 },
  { lowC: 401, highC: 600, lowI: 401, highI: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0) return 0;
  for (const bp of breakpoints) {
    if (concentration >= bp.lowC && concentration <= bp.highC) {
      return Math.round(
        ((bp.highI - bp.lowI) / (bp.highC - bp.lowC)) * (concentration - bp.lowC) + bp.lowI
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

  if (pollutants.pm25 !== undefined) {
    subIndices.push({ pollutant: "PM2.5", val: calculateSubIndex(pollutants.pm25, PM25_BREAKPOINTS) });
  }
  if (pollutants.pm10 !== undefined) {
    subIndices.push({ pollutant: "PM10", val: calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS) });
  }
  if (pollutants.no2 !== undefined) {
    subIndices.push({ pollutant: "NO2", val: calculateSubIndex(pollutants.no2, NO2_BREAKPOINTS) });
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
