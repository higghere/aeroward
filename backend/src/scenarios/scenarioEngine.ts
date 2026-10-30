export interface ScenarioParameters {
  city?: string;
  commercialVehicleDiversionPct: number; // 0 to 100
  siltSweepingWetSuppressionPct: number; // 0 to 100
  industrialFurnaceKilnModulationPct: number; // 0 to 100
  biomassBurningBanEnforcementPct: number; // 0 to 100
  streetVegetativeBufferPct: number; // 0 to 100
}

export interface DiurnalHourlyResponse {
  hour: number;
  timeLabel: string;
  baselinePm25: number;
  simulatedPm25: number;
  deltaPm25: number;
  baselinePblh_m: number;
  simulatedPblh_m: number;
}

export interface SpatialZoneImpact {
  zoneId: string;
  zoneName: string;
  baselinePm25: number;
  simulatedPm25: number;
  reductionPct: number;
  dominantMitigatedDriver: string;
  microEnvironmentType: "Arterial Highway Canyon" | "Industrial Plume Zone" | "High-Density Residential" | "Downwind Agrarian Basin";
}

export interface ScenarioSimulationResult {
  city: string;
  baseline: {
    pm25_ugm3: number;
    no2_ugm3: number;
    pblh_m: number;
    aot40_ppbh: number;
    feedbackLoopActive: boolean;
  };
  simulated: {
    pm25_ugm3: number;
    no2_ugm3: number;
    pblh_m: number;
    aot40_ppbh: number;
    feedbackLoopActive: boolean;
  };
  deltas: {
    deltaPm25_ugm3: number;
    deltaPm25_pct: number;
    deltaNo2_ugm3: number;
    deltaNo2_pct: number;
    pblhRecovery_m: number; // boundary layer expansion
    preventedFeedbackMass_pct: number;
    aot40Reduction_ppbh: number;
    projectedWheatYieldPreservation_pct: number;
  };
  sectorReductions: Array<{
    sector: string;
    appliedInterventionPct: number;
    deltaContribution_ugm3: number;
  }>;
  diurnalResponse: DiurnalHourlyResponse[];
  spatialFootprint: SpatialZoneImpact[];
  thermodynamicFeedbackInterruption: {
    isInterrupted: boolean;
    explanation: string;
  };
  methodologicalCaveat: string;
}

export class ScenarioEngine {
  simulate(params: ScenarioParameters): ScenarioSimulationResult {
    const city = params.city || "Kanpur";
    
    // Baseline winter values from Kanpur empirical studies (PDF Page 4-5)
    const basePm25 = 238; // Winter mean
    const baseNo2 = 64;
    const basePblh = 320;
    const baseAot40 = 3640;

    // Fractional contributions to winter PM2.5:
    // Vehicles: 27.2% (~64.7 µg/m³)
    // Dust: 7.8% (~18.6 µg/m³)
    // Industry/Kilns: 10.6% (~25.2 µg/m³)
    // Biomass/MSW: 18.4% (~43.8 µg/m³)
    // SIA/SOA (precursor mediated): ~36% (~85.7 µg/m³)

    const vehReduct = (params.commercialVehicleDiversionPct / 100) * 0.272 * 0.70; // 70% of vehicle emissions are commercial heavy vehicles
    const dustReduct = (params.siltSweepingWetSuppressionPct / 100) * 0.078 * 0.85; // 85% capture via regenerative wet sweepers
    const indReduct = (params.industrialFurnaceKilnModulationPct / 100) * 0.106 * 0.75;
    const bioReduct = (params.biomassBurningBanEnforcementPct / 100) * 0.184 * 0.80;
    const bufferReduct = (params.streetVegetativeBufferPct / 100) * 0.06; // localized roadside buffer filter

    // Secondary aerosol reduction bonus: reducing vehicles cuts NOx flux, suppressing secondary ammonium nitrate
    const secondarySiaMultiplier = 1.0 + (vehReduct * 0.45);
    const totalFractionalReduction = Math.min(
      0.65,
      (vehReduct + dustReduct + indReduct + bioReduct + bufferReduct) * secondarySiaMultiplier
    );

    const deltaPm25 = Number((basePm25 * totalFractionalReduction).toFixed(1));
    const simPm25 = Number((basePm25 - deltaPm25).toFixed(1));
    const deltaPm25Pct = Number(((deltaPm25 / basePm25) * 100).toFixed(1));

    // NOx reduction (Vehicles drive 78% of direct ground NOx)
    const deltaNo2 = Number((baseNo2 * (params.commercialVehicleDiversionPct / 100) * 0.52).toFixed(1));
    const simNo2 = Number((baseNo2 - deltaNo2).toFixed(1));
    const deltaNo2Pct = Number(((deltaNo2 / baseNo2) * 100).toFixed(1));

    // Aerosol-radiation-meteorological feedback disruption
    const pblhRecovery = Number((Math.min(68, deltaPm25 * 0.52)).toFixed(1));
    const simPblh = Math.round(basePblh + pblhRecovery);
    const isFeedbackInterrupted = deltaPm25Pct > 20 || simPm25 < 100;
    const preventedFeedbackMassPct = isFeedbackInterrupted
      ? Math.min(40, Number((deltaPm25Pct * 1.15).toFixed(1)))
      : 0;

    // Agro-ecosystem AOT40 wheat yield preservation
    const aot40Reduction = Number(
      (
        baseAot40 *
        ((params.commercialVehicleDiversionPct / 100) * 0.18 +
          (params.industrialFurnaceKilnModulationPct / 100) * 0.12)
      ).toFixed(0)
    );
    const simAot40 = Math.max(1400, baseAot40 - aot40Reduction);
    const yieldPreserved = Number((Math.min(9.8, (aot40Reduction / baseAot40) * 14.9)).toFixed(2));

    // 1. Synchronized Diurnal 24-Hour Response Curve
    const diurnalResponse: DiurnalHourlyResponse[] = [];
    for (let h = 0; h < 24; h++) {
      // Natural diurnal variation: shallow inversion in night/morning, convective mixing in afternoon
      const isNight = h < 9 || h >= 21;
      const hourStr = `${String(h).padStart(2, "0")}:00`;

      // Baseline diurnal profile: peaks at 08:00 (rush hour + inversion) and 22:00
      let baselineDiurnalMultiplier = 1.0;
      if (h === 7 || h === 8 || h === 9) baselineDiurnalMultiplier = 1.35;
      else if (h >= 21 || h <= 1) baselineDiurnalMultiplier = 1.25;
      else if (h >= 13 && h <= 16) baselineDiurnalMultiplier = 0.65; // afternoon convective dip
      else baselineDiurnalMultiplier = 0.95;

      const baseHourlyPm = Math.round(basePm25 * baselineDiurnalMultiplier);
      const baseHourlyPblh = isNight ? Math.round(280 + Math.sin(h) * 40) : Math.round(1150 + Math.cos((h - 14) / 3) * 350);

      // Simulated counterfactual profile:
      // Policy interventions (dust sweeping, truck diversions) significantly flatten the morning and night peaks!
      const hourlyReductionFactor = isNight
        ? totalFractionalReduction * 1.12 // Sweeping & truck diversion actively suppress morning/night peaks
        : totalFractionalReduction * 0.92;

      const simHourlyPm = Math.max(20, Math.round(baseHourlyPm * (1 - hourlyReductionFactor)));
      const deltaHourly = baseHourlyPm - simHourlyPm;
      const simHourlyPblh = Math.round(baseHourlyPblh + (isNight ? pblhRecovery * 0.8 : pblhRecovery * 1.4));

      diurnalResponse.push({
        hour: h,
        timeLabel: hourStr,
        baselinePm25: baseHourlyPm,
        simulatedPm25: simHourlyPm,
        deltaPm25: deltaHourly,
        baselinePblh_m: baseHourlyPblh,
        simulatedPblh_m: simHourlyPblh,
      });
    }

    // 2. Downwind Spatial Footprint Across 4 Urban & Regional Zones
    const spatialFootprint: SpatialZoneImpact[] = [
      {
        zoneId: "zone_urban_core",
        zoneName: "Urban Arterial Core (Nehru Nagar / Kalyanpur)",
        microEnvironmentType: "Arterial Highway Canyon",
        baselinePm25: 254,
        simulatedPm25: Math.round(254 * (1 - (vehReduct * 1.6 + dustReduct * 1.3))),
        reductionPct: Number(((vehReduct * 1.6 + dustReduct * 1.3) * 100).toFixed(1)),
        dominantMitigatedDriver: "Heavy Commercial Truck Diversion & Wet Sweeping",
      },
      {
        zoneId: "zone_industrial",
        zoneName: "Panki Heavy Manufacturing & Kiln Cluster",
        microEnvironmentType: "Industrial Plume Zone",
        baselinePm25: 282,
        simulatedPm25: Math.round(282 * (1 - (indReduct * 2.2 + dustReduct * 0.8))),
        reductionPct: Number(((indReduct * 2.2 + dustReduct * 0.8) * 100).toFixed(1)),
        dominantMitigatedDriver: "Industrial Furnace Rescheduling & Baghouse Scrubbing",
      },
      {
        zoneId: "zone_residential",
        zoneName: "Kidwai Nagar High-Density Residential",
        microEnvironmentType: "High-Density Residential",
        baselinePm25: 218,
        simulatedPm25: Math.round(218 * (1 - (vehReduct * 0.9 + bioReduct * 1.4 + bufferReduct * 1.5))),
        reductionPct: Number(((vehReduct * 0.9 + bioReduct * 1.4 + bufferReduct * 1.5) * 100).toFixed(1)),
        dominantMitigatedDriver: "Municipal Biomass Ban & Roadside Vegetative Screening",
      },
      {
        zoneId: "zone_downwind_basin",
        zoneName: "Downwind Agrarian Basin (Ganga Corridor & Unnao)",
        microEnvironmentType: "Downwind Agrarian Basin",
        baselinePm25: 184,
        simulatedPm25: Math.round(184 * (1 - (totalFractionalReduction * 0.85))),
        reductionPct: Number(((totalFractionalReduction * 0.85) * 100).toFixed(1)),
        dominantMitigatedDriver: "Reduced Urban Plume Transport & Secondary Precursor Depletion",
      },
    ];

    return {
      city,
      baseline: {
        pm25_ugm3: basePm25,
        no2_ugm3: baseNo2,
        pblh_m: basePblh,
        aot40_ppbh: baseAot40,
        feedbackLoopActive: true,
      },
      simulated: {
        pm25_ugm3: simPm25,
        no2_ugm3: simNo2,
        pblh_m: simPblh,
        aot40_ppbh: simAot40,
        feedbackLoopActive: !isFeedbackInterrupted,
      },
      deltas: {
        deltaPm25_ugm3: deltaPm25,
        deltaPm25_pct: deltaPm25Pct,
        deltaNo2_ugm3: deltaNo2,
        deltaNo2_pct: deltaNo2Pct,
        pblhRecovery_m: pblhRecovery,
        preventedFeedbackMass_pct: preventedFeedbackMassPct,
        aot40Reduction_ppbh: aot40Reduction,
        projectedWheatYieldPreservation_pct: yieldPreserved,
      },
      sectorReductions: [
        {
          sector: "Vehicular Exhaust (Commercial Freight & DG Sets)",
          appliedInterventionPct: params.commercialVehicleDiversionPct,
          deltaContribution_ugm3: Number((basePm25 * vehReduct).toFixed(1)),
        },
        {
          sector: "Road & Construction Silt (Wet Sweeping)",
          appliedInterventionPct: params.siltSweepingWetSuppressionPct,
          deltaContribution_ugm3: Number((basePm25 * dustReduct).toFixed(1)),
        },
        {
          sector: "Industrial Furnace & Brick Kiln Firing",
          appliedInterventionPct: params.industrialFurnaceKilnModulationPct,
          deltaContribution_ugm3: Number((basePm25 * indReduct).toFixed(1)),
        },
        {
          sector: "Biomass Stubble & MSW Trash Combustion",
          appliedInterventionPct: params.biomassBurningBanEnforcementPct,
          deltaContribution_ugm3: Number((basePm25 * bioReduct).toFixed(1)),
        },
        {
          sector: "Street Canyon Vegetative Screening",
          appliedInterventionPct: params.streetVegetativeBufferPct,
          deltaContribution_ugm3: Number((basePm25 * bufferReduct).toFixed(1)),
        },
      ],
      diurnalResponse,
      spatialFootprint,
      thermodynamicFeedbackInterruption: {
        isInterrupted: isFeedbackInterrupted,
        explanation: isFeedbackInterrupted
          ? `Simulated emissions reductions decrease black carbon absorption aloft near 925 hPa, recovering daytime boundary layer height by +${pblhRecovery}m and preventing up to ${preventedFeedbackMassPct}% of secondary aerosol mass accumulation.`
          : "Emissions reductions are insufficient to cross the stabilization threshold (PM2.5 remains above 100 µg/m³ with active nocturnal inversion).",
      },
      methodologicalCaveat:
        "SCIENTIFIC SIMULATION DISCLAIMER: This scenario laboratory applies parameterized chemical transport response functions derived from Kanpur source apportionment literature. It models counterfactual policy options for comparative analysis and does not constitute a legal or operational guarantee of ambient atmospheric compliance.",
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
