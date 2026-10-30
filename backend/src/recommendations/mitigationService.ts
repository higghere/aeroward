export interface MunicipalAction {
  id: string;
  category: "Street Silt Suppression" | "Heavy Freight Diversion" | "Industrial Batch Rescheduling" | "Biomass & Waste Enforcement";
  targetCorridorOrZone: string;
  triggerCondition: string;
  leadTimeHours: number;
  operationalWindow: string;
  actionProtocol: string;
  expectedAtmosphericBenefit: string;
  uncertaintyAndLimitation: string;
  responsibleAgency: string;
}

export interface BuildingAutomationCommand {
  bmsSubsystem: "Building Pressurization" | "HVAC Damper Actuation" | "HEPA Filtration Dynamic Cycle";
  targetTimeOffsetMinutes: number;
  commandPayload: {
    setpoint: string;
    mode: string;
    protocol: "BACnet / Modbus-TCP / IoT MQTT";
  };
  operationalRationale: string;
}

export interface SchoolMitigationAdvisory {
  facilityType: "Schools & Early Daycares";
  actionableThreshold: string;
  outdoorActivityRestriction: string;
  morningArrivalAdvisory: string;
  indoorHepaRuntimeSchedule: string;
  co2VsAerosolVentilationProtocol: string;
}

export interface HospitalMitigationAdvisory {
  facilityType: "Hospitals & Healthcare Facilities";
  vulnerableWardFiltrationProtocol: string;
  emergencyDepartmentPreStaffingAlert: string;
  hvacFreshAirDamperActuation: string;
  patientDischargeTimingGuidance: string;
}

export interface CitizenMitigationGuidance {
  targetGroup: "Asthmatics & Pediatric" | "Elderly & Cardiovascular" | "Outdoor Workers & Cyclists" | "General Public";
  recommendedTimeWindow: string;
  avoidTimeWindow: string;
  exposureMinimaExplanation: string;
  maskSelectionProtocol: string;
  indoorSanctuaryAction: string;
}

export interface PredictiveGrapPlan {
  city: string;
  forecastTimestamp: string;
  predictedStagnationWindow: string;
  stagnationIndicators: {
    windSpeedForecast_ms: number;
    boundaryLayerForecast_m: number;
    thermalInversionExpected: boolean;
  };
  reactiveVsPredictiveComparison: {
    reactiveLagHours: string;
    predictiveLeadTimeHours: string;
    preventedPeakSurgePct: number;
  };
  municipalActions: MunicipalAction[];
  buildingAutomationCommands: BuildingAutomationCommand[];
  schoolAdvisories: SchoolMitigationAdvisory[];
  hospitalAdvisories: HospitalMitigationAdvisory[];
  citizenGuidance: CitizenMitigationGuidance[];
}

export class MitigationService {
  getPredictiveGrapPlan(city: string = "Kanpur"): PredictiveGrapPlan {
    const now = new Date();
    const stagnationStart = new Date(now.getTime() + 18 * 3600000);
    const stagnationEnd = new Date(now.getTime() + 36 * 3600000);

    return {
      city,
      forecastTimestamp: now.toISOString(),
      predictedStagnationWindow: `${stagnationStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${stagnationEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      stagnationIndicators: {
        windSpeedForecast_ms: 1.1,
        boundaryLayerForecast_m: 290,
        thermalInversionExpected: true,
      },
      reactiveVsPredictiveComparison: {
        reactiveLagHours: "12 to 24 hours administrative delay (enacted post-breach)",
        predictiveLeadTimeHours: "12 to 36 hours advance notice (dispatched pre-inversion)",
        preventedPeakSurgePct: 32,
      },
      municipalActions: [
        {
          id: "muni_silt_01",
          category: "Street Silt Suppression",
          targetCorridorOrZone: "GT Road Arterial Corridor (Nehru Nagar to Kalyanpur) & Industrial Corridors",
          triggerCondition: "Continuous monitoring indicates silt loading > 2.0 g/m² (Current: 6.8 g/m²) and forecast wind < 1.5 m/s",
          leadTimeHours: 6,
          operationalWindow: "Shift mechanical cleaning from daytime to 15:30 - 18:00 (4-6 hours prior to nocturnal thermal inversion descent)",
          actionProtocol:
            "Deploy regenerative-air vacuum sweepers coupled with fine-droplet wet suppression to stabilize surface crustal silt, preventing vehicle turbulence from injecting coarse and fine dust into the evening transition layer.",
          expectedAtmosphericBenefit: "Reduces ground-level evening dust resuspension by up to 28% across critical transit canyons.",
          uncertaintyAndLimitation: "Requires continuous water replenishment; heavy unpaved shoulders may re-contaminate swept carriageway within 8 hours.",
          responsibleAgency: "Kanpur Municipal Corporation (Nagar Nigam) / PWD",
        },
        {
          id: "muni_freight_02",
          category: "Heavy Freight Diversion",
          targetCorridorOrZone: "Inner Ring Road, Mall Road, and Grand Trunk Urban Arteries",
          triggerCondition: "Nocturnal boundary layer height forecast to compress below 300m at 22:00 IST",
          leadTimeHours: 12,
          operationalWindow: "Activate outer peripheral highway bypass diversion checkpoints from 18:00 IST onward",
          actionProtocol:
            "Reroute non-essential multi-axle diesel freight around the peripheral national bypass, prohibiting inner urban canyon ingress during the early stages of temperature inversion formation.",
          expectedAtmosphericBenefit:
            "Curtails direct ground-level NOx emissions (preventing nocturnal ammonium nitrate aerosol formation) and black carbon flux.",
          uncertaintyAndLimitation: "Requires inter-district traffic police coordination and dedicated highway bypass holding lanes.",
          responsibleAgency: "Kanpur Traffic Police / National Highways Authority of India (NHAI)",
        },
        {
          id: "muni_industry_03",
          category: "Industrial Batch Rescheduling",
          targetCorridorOrZone: "Panki Industrial Area & Outer Periphery Brick Kiln Clusters",
          triggerCondition: "Predicted multi-day atmospheric stagnation with synoptic ventilation index < 1500 m²/s",
          leadTimeHours: 24,
          operationalWindow: "Shift high-emission batch production firing cycles away from nocturnal low-dispersion window (20:00 - 08:00)",
          actionProtocol:
            "Issue digital advance dispatch notices to operators of brick kilns, secondary metallurgical furnaces, and concrete batch plants to halt primary firing until daytime convective mixing resumes.",
          expectedAtmosphericBenefit: "Prevents point-source stack discharges from accumulating in the stable nocturnal inversion volume.",
          uncertaintyAndLimitation: "Requires automated CPCB/UPPCB continuous emission monitoring system (OCEMS) telemetry verification.",
          responsibleAgency: "Uttar Pradesh Pollution Control Board (UPPCB) Regional Office",
        },
        {
          id: "muni_waste_04",
          category: "Biomass & Waste Enforcement",
          targetCorridorOrZone: "Peri-urban agricultural edges & ward-level solid waste dump interfaces",
          triggerCondition: "Sentinel-5P UVAI > 1.4 combined with calm boundary layer (<1.5 m/s)",
          leadTimeHours: 18,
          operationalWindow: "Nighttime patrol shifts (20:00 - 05:00 IST)",
          actionProtocol:
            "Deploy drone-assisted thermal infrared night patrols to detect localized open municipal waste burning and agricultural stubble incineration.",
          expectedAtmosphericBenefit: "Directly suppresses primary brown carbon, polycyclic aromatics, and levoglucosan plumes.",
          uncertaintyAndLimitation: "High spatial dispersion of informal waste burning sites requires community reporting mechanisms.",
          responsibleAgency: "Kanpur Municipal Solid Waste Enforcement Wing",
        },
      ],
      buildingAutomationCommands: [
        {
          bmsSubsystem: "Building Pressurization",
          targetTimeOffsetMinutes: 60,
          commandPayload: {
            setpoint: "+15 Pascals positive internal static pressure relative to outdoors",
            mode: "Pre-Inversion Protective Pressurization",
            protocol: "BACnet / Modbus-TCP / IoT MQTT",
          },
          operationalRationale:
            "Pressurizes internal volume 60 minutes before thermal inversion to establish outward airflow through facade gaps and doorways, preventing toxic aerosol infiltration.",
        },
        {
          bmsSubsystem: "HVAC Damper Actuation",
          targetTimeOffsetMinutes: 30,
          commandPayload: {
            setpoint: "10% minimum fresh-air damper opening; 90% full internal air recirculation",
            mode: "Nocturnal Inversion Isolation Cycle",
            protocol: "BACnet / Modbus-TCP / IoT MQTT",
          },
          operationalRationale:
            "Throttles outdoor intake during stagnant nocturnal boundary layer compression (22:00 - 07:00), preventing high outdoor PM2.5/NOx from charging the indoor ductwork.",
        },
        {
          bmsSubsystem: "HEPA Filtration Dynamic Cycle",
          targetTimeOffsetMinutes: 0,
          commandPayload: {
            setpoint: "Maximum ECM fan speed; differential pressure monitor set to 250 Pa threshold",
            mode: "Pre-Occupancy Deep Cleansing Cycle",
            protocol: "BACnet / Modbus-TCP / IoT MQTT",
          },
          operationalRationale:
            "Cycles air through MERV 16 + HEPA filter banks 2 hours prior to building occupancy, reducing indoor PM2.5 concentrations below 15 µg/m³ before staff and visitor arrival.",
        },
      ],
      schoolAdvisories: [
        {
          facilityType: "Schools & Early Daycares",
          actionableThreshold: "Forecast PM2.5 > 120 µg/m³ or Air Quality Index > 250 between 06:00 and 10:00 IST",
          outdoorActivityRestriction:
            "Mandatory suspension of all morning outdoor sports, physical education drills, and school ground assemblies. Children have higher minute ventilation per kilogram of body weight, doubling lung alveolar deposition during morning exercise.",
          morningArrivalAdvisory:
            "During severe winter thermal inversions (December–January), delay campus opening from 07:30 to 09:00 IST. Surface particulate concentrations drop by 35–45% once solar insolation breaks the surface inversion and lifts the mixing layer above 600m.",
          indoorHepaRuntimeSchedule:
            "Initiate automated classroom HEPA filtration units at 06:30 IST (1 hour prior to arrival). Maintain continuous low-noise recirculation mode throughout class sessions.",
          co2VsAerosolVentilationProtocol:
            "Keep external doors and windows sealed during morning traffic rush hours (07:30–10:00). If classroom indoor CO2 exceeds 1,000 ppm, execute brief 5-minute cross-ventilation during peak afternoon solar mixing (13:30–14:30) when outdoor pollution is at diurnal minimum.",
        },
      ],
      hospitalAdvisories: [
        {
          facilityType: "Hospitals & Healthcare Facilities",
          vulnerableWardFiltrationProtocol:
            "Maintain strict positive pressure (+20 to +25 Pa) in Neonatal ICU, Pulmonary Care, Cardiology, and Post-Operative Wards using dedicated multi-stage HEPA filters (99.97% capture at 0.3 µm) with in-line activated carbon beds to scrub gaseous NO2 and SO2.",
          emergencyDepartmentPreStaffingAlert:
            "Automated clinical dispatch alert sent 18 hours prior to predicted inversion stagnation: pre-staff triage bays with dedicated respiratory therapy nurses and verify 48-hour inventories of nebulization solution, bronchodilators, and supplemental oxygen.",
          hvacFreshAirDamperActuation:
            "Damp fresh outdoor air intake down to statutory minimum compliance (10–15%) between 21:00 and 08:30 IST to isolate internal healthcare volumes from ambient nocturnal boundary layer compression.",
          patientDischargeTimingGuidance:
            "Prohibit discharging recovering COPD, asthma, and acute coronary syndrome patients during peak morning stagnation hours (06:00–09:30 IST). Schedule outbound transit after 11:30 IST when convective vertical dispersion is fully active.",
        },
      ],
      citizenGuidance: [
        {
          targetGroup: "Asthmatics & Pediatric",
          recommendedTimeWindow: "12:00 – 16:00 IST (Peak Solar Mixing)",
          avoidTimeWindow: "06:00 – 09:30 IST & 20:00 – 23:00 IST",
          exposureMinimaExplanation:
            "Nocturnal ground-level inversions compress vehicular exhaust and biomass emissions into a thin shallow blanket beneath 300m during morning hours. Convective mixing lifts this layer after 11:00 AM.",
          maskSelectionProtocol:
            "Certified N95 or FFP2 respirator with tight facial seal. Basic cloth or surgical masks offer less than 15% filtration efficiency against submicron combustion particulates.",
          indoorSanctuaryAction:
            "Create a sealed 'clean air bedroom' with a standalone true HEPA purifier. Avoid burning incense sticks (agarbatti), mosquito coils, or unvented biomass space heaters indoors.",
        },
        {
          targetGroup: "Elderly & Cardiovascular",
          recommendedTimeWindow: "12:30 – 15:30 IST (Elevated PBLH)",
          avoidTimeWindow: "05:30 – 09:00 IST (Peak Surface Inversion)",
          exposureMinimaExplanation:
            "Ultrafine particulates (PM0.1) translocate directly into systemic circulation during cold morning walks, causing acute arterial vasoconstriction and elevated platelet aggregation.",
          maskSelectionProtocol:
            "N95 or KF94 respirator with exhalation valve to minimize breathing resistance for individuals with pre-existing cardiopulmonary compromise.",
          indoorSanctuaryAction:
            "Keep windows shut facing arterial traffic corridors. Run HEPA filtration overnight in sleeping quarters.",
        },
        {
          targetGroup: "Outdoor Workers & Cyclists",
          recommendedTimeWindow: "Midday transit along windward pedestrian corridors",
          avoidTimeWindow: "Rush hour street canyons (07:30 – 10:30 & 18:00 – 21:00)",
          exposureMinimaExplanation:
            "Deep street canyons (H/W ≥ 1.0) generate leeward vortex recirculation where vehicle tailpipe emissions linger up to 18% longer. Physical cycling increases respiratory minute ventilation from 15 to 45 L/min.",
          maskSelectionProtocol:
            "N99 or N95 respirator equipped with silicone face seal and exhalation valve to prevent moisture buildup and maintain seal during exertion.",
          indoorSanctuaryAction:
            "Rinse nasal passages with saline solution post-shift to clear coarse dust deposition from upper airways.",
        },
        {
          targetGroup: "General Public",
          recommendedTimeWindow: "11:00 – 17:00 IST",
          avoidTimeWindow: "Late evening biomass burning (20:00 – 23:00 IST)",
          exposureMinimaExplanation:
            "Plan daily outdoor errands during the diurnal afternoon trough when solar radiation warms the surface and expands the mixing volume.",
          maskSelectionProtocol:
            "N95 respirator during any outdoor commute when AQI exceeds 200.",
          indoorSanctuaryAction:
            "Ensure weather-stripping on exterior doors to prevent particulate infiltration into residential spaces.",
        },
      ],
    };
  }
}

export const mitigationService = new MitigationService();
