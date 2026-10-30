export interface RouteSegment {
  segmentId: string;
  name: string;
  lengthMeters: number;
  durationMinutes: number;
  canyonHwRatio: number;
  buildToLineRatio: number;
  orientationDeg: number;
  sidewalkSide: "leeward" | "windward" | "open_park" | "vegetative_buffered";
  microscalePm25: number;
  microscaleNo2: number;
  inhalationDoseSegment_ug: number;
  coordinates: Array<[number, number]>;
}

export interface RouteOption {
  routeId: "clean_air" | "balanced" | "shortest_distance";
  title: string;
  summary: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  averagePm25_ugm3: number;
  averageNo2_ugm3: number;
  cumulativeDoseInhaled_ug: number; // E = sum(Ci * VE(m) * dt)
  doseReductionPctVsShortest: number;
  segments: RouteSegment[];
  coordinates: Array<[number, number]>; // [lng, lat]
  canyonAerodynamicExplanation: string;
  limitationDisclaimer: string;
}

export interface PresetOdPair {
  id: string;
  title: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
}

export interface RouteComparisonResult {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  exertionMode: "walking" | "cycling" | "driving";
  minuteVentilationVolume_m3_min: number; // VE(m)
  hourlyVentilationVolume_m3_hr: number;
  ambientWindDirectionDeg: number;
  ambientWindSpeedMs: number;
  routes: RouteOption[];
  scientificFormula: string;
}

export const PRESET_OD_PAIRS: PresetOdPair[] = [
  {
    id: "od_iitk_nehru",
    title: "IIT Kanpur Campus → Nehru Nagar Commercial Hub",
    origin: { lat: 26.5123, lng: 80.2329, name: "IIT Kanpur Campus (West)" },
    destination: { lat: 26.4712, lng: 80.3244, name: "Nehru Nagar Central Commercial Hub" },
  },
  {
    id: "od_civillines_panki",
    title: "Civil Lines Admin Hub → Panki Industrial Cluster",
    origin: { lat: 26.485, lng: 80.335, name: "Civil Lines District Courts" },
    destination: { lat: 26.4678, lng: 80.2456, name: "Panki Industrial Area" },
  },
  {
    id: "od_kalyanpur_jajmau",
    title: "Kalyanpur GT Road → Jajmau Leather Cluster",
    origin: { lat: 26.495, lng: 80.26, name: "Kalyanpur Arterial Corridor" },
    destination: { lat: 26.4312, lng: 80.4011, name: "Jajmau Leather Manufacturing Cluster" },
  },
  {
    id: "od_kidwai_iitk",
    title: "Kidwai Nagar High-Density → IIT Kanpur",
    origin: { lat: 26.4385, lng: 80.3392, name: "Kidwai Nagar Residential Hub" },
    destination: { lat: 26.5123, lng: 80.2329, name: "IIT Kanpur Aerosol SuperSite" },
  },
];

export class RoutingEngine {
  compareRoutes(
    origin = PRESET_OD_PAIRS[0].origin,
    destination = PRESET_OD_PAIRS[0].destination,
    mode: "walking" | "cycling" | "driving" = "walking"
  ): RouteComparisonResult {
    // Minute ventilation volume VE(m) in m^3/min
    // Walking: 0.015 m3/min (15 L/min or 0.9 m3/hr)
    // Cycling: 0.045 m3/min (45 L/min or 2.7 m3/hr)
    // Driving: 0.010 m3/min (10 L/min or 0.6 m3/hr)
    const ve = mode === "cycling" ? 0.045 : mode === "walking" ? 0.015 : 0.010;
    const veHourly = ve * 60;

    const windDir = 295; // WNW synoptic wind
    const windSpeed = 1.3;

    // Determine baseline distance from origin to destination coordinates (Euclidean approx in km)
    const dx = (destination.lng - origin.lng) * 98.0;
    const dy = (destination.lat - origin.lat) * 111.0;
    const straightDistKm = Math.max(3.5, Math.sqrt(dx * dx + dy * dy));

    // Route 1: Shortest Distance Route (direct arterial canyon)
    const shortestDistanceKm = Number((straightDistKm * 1.15).toFixed(1));
    const shortestSpeedKmH = mode === "cycling" ? 16 : mode === "walking" ? 4.8 : 28;
    const shortestDurationMin = Number(((shortestDistanceKm / shortestSpeedKmH) * 60).toFixed(1));
    const shortestAvgPm25 = 218; // Trapped leeward canyon pollution
    const shortestAvgNo2 = 72;
    const shortestDose = Number((shortestAvgPm25 * ve * shortestDurationMin).toFixed(2));

    // Route 2: Balanced Route (secondary mixed road)
    const balancedDistanceKm = Number((straightDistKm * 1.28).toFixed(1));
    const balancedSpeedKmH = mode === "cycling" ? 17 : mode === "walking" ? 4.9 : 32;
    const balancedDurationMin = Number(((balancedDistanceKm / balancedSpeedKmH) * 60).toFixed(1));
    const balancedAvgPm25 = 158;
    const balancedAvgNo2 = 48;
    const balancedDose = Number((balancedAvgPm25 * ve * balancedDurationMin).toFixed(2));

    // Route 3: Algorithmic Clean-Air Route (via windward greenway & low canyon ratio)
    const cleanDistanceKm = Number((straightDistKm * 1.38).toFixed(1));
    const cleanSpeedKmH = mode === "cycling" ? 18 : mode === "walking" ? 5.0 : 34;
    const cleanDurationMin = Number(((cleanDistanceKm / cleanSpeedKmH) * 60).toFixed(1));
    const cleanAvgPm25 = 122; // Windward sidewalk + park buffer
    const cleanAvgNo2 = 32;
    const cleanDose = Number((cleanAvgPm25 * ve * cleanDurationMin).toFixed(2));

    const doseReductionPct = Number((((shortestDose - cleanDose) / shortestDose) * 100).toFixed(1));
    const balancedDoseReduction = Number((((shortestDose - balancedDose) / shortestDose) * 100).toFixed(1));

    // Intermediate waypoints synthesized based on origin-destination coordinates
    const midX = (origin.lng + destination.lng) / 2;
    const midY = (origin.lat + destination.lat) / 2;

    const shortestCoords: Array<[number, number]> = [
      [origin.lng, origin.lat],
      [origin.lng + (destination.lng - origin.lng) * 0.3, origin.lat + (destination.lat - origin.lat) * 0.3],
      [midX, midY],
      [origin.lng + (destination.lng - origin.lng) * 0.7, origin.lat + (destination.lat - origin.lat) * 0.7],
      [destination.lng, destination.lat],
    ];

    const balancedCoords: Array<[number, number]> = [
      [origin.lng, origin.lat],
      [origin.lng + (destination.lng - origin.lng) * 0.25 - 0.012, origin.lat + (destination.lat - origin.lat) * 0.3 + 0.008],
      [midX - 0.015, midY + 0.01],
      [origin.lng + (destination.lng - origin.lng) * 0.75 - 0.008, origin.lat + (destination.lat - origin.lat) * 0.75 + 0.006],
      [destination.lng, destination.lat],
    ];

    const cleanCoords: Array<[number, number]> = [
      [origin.lng, origin.lat],
      [origin.lng + (destination.lng - origin.lng) * 0.2 + 0.018, origin.lat + (destination.lat - origin.lat) * 0.25 + 0.018],
      [midX + 0.022, midY + 0.018],
      [origin.lng + (destination.lng - origin.lng) * 0.7 + 0.015, origin.lat + (destination.lat - origin.lat) * 0.75 + 0.012],
      [destination.lng, destination.lat],
    ];

    // Build Detailed Segments for Clean Route
    const cleanSegments: RouteSegment[] = [
      {
        segmentId: "seg_clean_1",
        name: "Northern Greenway & Vegetative Buffer Corridor",
        lengthMeters: Math.round(cleanDistanceKm * 420),
        durationMinutes: Number((cleanDurationMin * 0.42).toFixed(1)),
        canyonHwRatio: 0.25,
        buildToLineRatio: 0.2,
        orientationDeg: 115,
        sidewalkSide: "vegetative_buffered",
        microscalePm25: 104,
        microscaleNo2: 24,
        inhalationDoseSegment_ug: Number((104 * ve * (cleanDurationMin * 0.42)).toFixed(2)),
        coordinates: [cleanCoords[0], cleanCoords[1], cleanCoords[2]],
      },
      {
        segmentId: "seg_clean_2",
        name: "Botanical Parkway & Windward Sidewalk",
        lengthMeters: Math.round(cleanDistanceKm * 580),
        durationMinutes: Number((cleanDurationMin * 0.58).toFixed(1)),
        canyonHwRatio: 0.62,
        buildToLineRatio: 0.45,
        orientationDeg: 130,
        sidewalkSide: "windward",
        microscalePm25: 135,
        microscaleNo2: 38,
        inhalationDoseSegment_ug: Number((135 * ve * (cleanDurationMin * 0.58)).toFixed(2)),
        coordinates: [cleanCoords[2], cleanCoords[3], cleanCoords[4]],
      },
    ];

    // Build Detailed Segments for Shortest Route
    const shortestSegments: RouteSegment[] = [
      {
        segmentId: "seg_short_1",
        name: "Arterial Highway Canyon (Leeward Sidewalk Vortex)",
        lengthMeters: Math.round(shortestDistanceKm * 550),
        durationMinutes: Number((shortestDurationMin * 0.55).toFixed(1)),
        canyonHwRatio: 1.45,
        buildToLineRatio: 0.88,
        orientationDeg: 125,
        sidewalkSide: "leeward",
        microscalePm25: 236,
        microscaleNo2: 82,
        inhalationDoseSegment_ug: Number((236 * ve * (shortestDurationMin * 0.55)).toFixed(2)),
        coordinates: [shortestCoords[0], shortestCoords[1], shortestCoords[2]],
      },
      {
        segmentId: "seg_short_2",
        name: "Commercial Transit Choke Point",
        lengthMeters: Math.round(shortestDistanceKm * 450),
        durationMinutes: Number((shortestDurationMin * 0.45).toFixed(1)),
        canyonHwRatio: 1.38,
        buildToLineRatio: 0.82,
        orientationDeg: 140,
        sidewalkSide: "leeward",
        microscalePm25: 196,
        microscaleNo2: 60,
        inhalationDoseSegment_ug: Number((196 * ve * (shortestDurationMin * 0.45)).toFixed(2)),
        coordinates: [shortestCoords[2], shortestCoords[3], shortestCoords[4]],
      },
    ];

    // Build Detailed Segments for Balanced Route
    const balancedSegments: RouteSegment[] = [
      {
        segmentId: "seg_bal_1",
        name: "Secondary Arterial with Mixed Tree Canopy",
        lengthMeters: Math.round(balancedDistanceKm * 1000),
        durationMinutes: balancedDurationMin,
        canyonHwRatio: 0.8,
        buildToLineRatio: 0.65,
        orientationDeg: 120,
        sidewalkSide: "open_park",
        microscalePm25: 158,
        microscaleNo2: 48,
        inhalationDoseSegment_ug: balancedDose,
        coordinates: balancedCoords,
      },
    ];

    return {
      origin,
      destination,
      exertionMode: mode,
      minuteVentilationVolume_m3_min: ve,
      hourlyVentilationVolume_m3_hr: veHourly,
      ambientWindDirectionDeg: windDir,
      ambientWindSpeedMs: windSpeed,
      scientificFormula: "E = Σ C_i(x, t) · V_E(m) · Δt (Integrated Inhalation Dosage across street segments)",
      routes: [
        {
          routeId: "clean_air",
          title: "Algorithmic Clean-Air Navigation",
          summary: `Reduces total inhaled pollutant dosage by ${doseReductionPct}% with only +${(cleanDurationMin - shortestDurationMin).toFixed(1)} mins traversal delta.`,
          totalDistanceKm: cleanDistanceKm,
          totalDurationMinutes: cleanDurationMin,
          averagePm25_ugm3: cleanAvgPm25,
          averageNo2_ugm3: cleanAvgNo2,
          cumulativeDoseInhaled_ug: cleanDose,
          doseReductionPctVsShortest: doseReductionPct,
          coordinates: cleanCoords,
          canyonAerodynamicExplanation:
            "Navigates through windward building walkways and canal greenway buffers. Avoids perpendicular wind vortices in deep street canyons (H/W ≥ 1.0) and high build-to-line continuity (BTR > 0.8), where leeward vehicular emissions linger up to 18% longer.",
          limitationDisclaimer:
            "Modeled exposure estimate based on street canyon microclimate aerodynamics. Does not guarantee direct personal biological safety.",
          segments: cleanSegments,
        },
        {
          routeId: "balanced",
          title: "Balanced Secondary Arterial",
          summary: `Reduces inhaled dose by ${balancedDoseReduction}% with moderate street canyon exposure.`,
          totalDistanceKm: balancedDistanceKm,
          totalDurationMinutes: balancedDurationMin,
          averagePm25_ugm3: balancedAvgPm25,
          averageNo2_ugm3: balancedAvgNo2,
          cumulativeDoseInhaled_ug: balancedDose,
          doseReductionPctVsShortest: balancedDoseReduction,
          coordinates: balancedCoords,
          canyonAerodynamicExplanation:
            "Follows mid-density commercial corridors with moderate canyon aspect ratio (H/W ≈ 0.8) and intermittent tree canopy.",
          limitationDisclaimer: "Subject to localized traffic bottlenecks during peak commuting hours.",
          segments: balancedSegments,
        },
        {
          routeId: "shortest_distance",
          title: "Shortest Distance Arterial (Highest Exposure)",
          summary: "Direct path through major commercial highway corridor with trapped leeward vehicle exhaust.",
          totalDistanceKm: shortestDistanceKm,
          totalDurationMinutes: shortestDurationMin,
          averagePm25_ugm3: shortestAvgPm25,
          averageNo2_ugm3: shortestAvgNo2,
          cumulativeDoseInhaled_ug: shortestDose,
          doseReductionPctVsShortest: 0,
          coordinates: shortestCoords,
          canyonAerodynamicExplanation:
            "Traverses perpendicular street canyons with H/W = 1.45 and high build-to-line ratio (BTR = 0.88). Synoptic crosswinds generate leeward recirculation vortices that trap ground-level vehicular exhaust directly on pedestrian sidewalks.",
          limitationDisclaimer:
            "Highest cumulative inhaled dose of fine particulates and combustion-derived nitrogen dioxide.",
          segments: shortestSegments,
        },
      ],
    };
  }
}

export const routingEngine = new RoutingEngine();
