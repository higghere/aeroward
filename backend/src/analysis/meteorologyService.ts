export interface MeteorologicalThermodynamicsResult {
  city: string;
  synopticConditions: {
    windSpeedMs: number;
    windDirectionDeg: number;
    isStagnant: boolean; // True when wind < 1.5 m/s
    stagnationThresholdMs: number;
    boundaryLayerHeight_m: number;
    surfaceInversionStrength_c100m: number;
    relativeHumidity_pct: number;
    solarRadiation_wm2: number;
  };
  aerosolRadiationFeedback: {
    status: "Active Feedback Loop" | "Pre-Feedback Regime" | "Ventilated Regime";
    thresholdRangePm25: [number, number]; // 75 - 100 µg/m^3
    pblhDepressionObserved_m: number; // 200 - 400 m
    elevatedLayerWarmingAltitude_hpa: number; // 925 hPa
    secondaryAerosolAcceleration: string;
    mitigationPotential: {
      daytimePblhRecovery_m: number; // >50 m
      preventedFeedbackMassPct: number; // up to 40%
    };
    mechanisticExplanation: string;
  };
  photochemicalOzoneDynamics: {
    regime: "NOx-Saturated (VOC-Limited)" | "NOx-Sensitive";
    chemicalReactions: Array<{
      step: string;
      reactionEquation: string;
      role: string;
    }>;
    ozoneTitrationWarning: string;
    aot40AgroIndex: {
      definition: "Accumulated exposure Over a Threshold of 40 ppb (daylight hours with Solar Rad > 50 W/m²)";
      equation: "AOT40 = Σ max(0, [O3] - 40 ppb)";
      currentAot40_ppbh: number;
      criticalCropThreshold_ppbh: number; // 3,000 ppb*h
      isCriticalThresholdExceeded: boolean;
      affectedCrop: "Winter Wheat (Triticum aestivum) during anthesis & grain filling";
      modeledYieldLossRangePct: [number, number]; // [6.4, 14.9]
      foliarDamageMechanism: "Ozone enters stomatal pores, generating reactive oxygen species that disrupt chloroplast membranes and suppress Rubisco enzyme activity.";
    };
  };
}

export class MeteorologyService {
  getAtmosphericAnalysis(city: string = "Kanpur"): MeteorologicalThermodynamicsResult {
    return {
      city,
      synopticConditions: {
        windSpeedMs: 1.2,
        windDirectionDeg: 295,
        isStagnant: true, // Trigger: < 1.5 m/s triggers predictive GRAP dispatch
        stagnationThresholdMs: 1.5,
        boundaryLayerHeight_m: 320,
        surfaceInversionStrength_c100m: 2.8,
        relativeHumidity_pct: 74,
        solarRadiation_wm2: 480,
      },
      aerosolRadiationFeedback: {
        status: "Active Feedback Loop",
        thresholdRangePm25: [75, 100],
        pblhDepressionObserved_m: 280, // Paper notes 200 to 400 meters suppression
        elevatedLayerWarmingAltitude_hpa: 925,
        secondaryAerosolAcceleration:
          "Surface cooling and upper-layer warming strengthen temperature inversion, confining primary pollutants into a shallow mixing volume. Decreased saturation vapor pressure increases surface RH (>70%), driving rapid aqueous-phase and heterogeneous oxidation of SO2 and NOx into secondary aerosols.",
        mitigationPotential: {
          daytimePblhRecovery_m: 54, // >50 m recovery
          preventedFeedbackMassPct: 38, // up to 40% prevented
        },
        mechanisticExplanation:
          "Light-absorbing aerosols (black carbon) absorb solar radiation aloft near 925 hPa while scattering solar radiation back to space. This suppresses buoyant convective turbulence, depressing planetary boundary layer height by 200-400m and locking in multi-day surface haze.",
      },
      photochemicalOzoneDynamics: {
        regime: "NOx-Saturated (VOC-Limited)",
        chemicalReactions: [
          {
            step: "Photolysis",
            reactionEquation: "NO2 + hν (λ < 420 nm) → NO + O(³P)",
            role: "Solar UV radiation cleaves NO2 into nitric oxide and triplet ground-state oxygen atom.",
          },
          {
            step: "Ozone Formation",
            reactionEquation: "O(³P) + O2 + M → O3 + M",
            role: "Ground-state oxygen atom rapidly combines with atmospheric molecular oxygen in the presence of third-body molecule M.",
          },
          {
            step: "Local Titration",
            reactionEquation: "NO + O3 → NO2 + O2",
            role: "Fresh vehicular NO emissions react directly with ozone, depressing local surface O3 concentrations near high-traffic corridors.",
          },
        ],
        ozoneTitrationWarning:
          "WARNING ON ISOLATED AEROSOL CURBS: Dense particulate plumes attenuate solar actinic flux, suppressing photolysis. Indiscriminately reducing particulate matter without coordinated precursor NOx and VOC abatement can cause sudden afternoon ozone surges as UV radiation penetrates down to the surface.",
        aot40AgroIndex: {
          definition: "Accumulated exposure Over a Threshold of 40 ppb (daylight hours with Solar Rad > 50 W/m²)",
          equation: "AOT40 = Σ max(0, [O3] - 40 ppb)",
          currentAot40_ppbh: 3640,
          criticalCropThreshold_ppbh: 3000,
          isCriticalThresholdExceeded: true,
          affectedCrop: "Winter Wheat (Triticum aestivum) during anthesis & grain filling",
          modeledYieldLossRangePct: [6.4, 14.9],
          foliarDamageMechanism:
            "Ozone enters stomatal pores, generating reactive oxygen species that disrupt chloroplast membranes and suppress Rubisco enzyme activity.",
        },
      },
    };
  }
}

export const meteorologyService = new MeteorologyService();
