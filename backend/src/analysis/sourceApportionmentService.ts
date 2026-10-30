export interface SourceSectorApportionment {
  sector: string;
  chemicalFingerprint: string;
  typicalGroundLevelProfile: string;
  summerContributionRange: [number, number]; // [min%, max%]
  winterContributionRange: [number, number];
  currentEstimatedContributionPct: number;
  evidenceTier: "Formal Chemical Mass Balance / PMF Receptor Study" | "Optical Carbon Speciation (EC/OC)" | "Machine Learning Feature Attribution (Diagnostic)";
  actionableMitigation: string;
}

export interface SourceAnalysisResult {
  city: string;
  season: "Winter" | "Summer" | "Monsoon" | "Post-Monsoon Transition";
  ambientPm25Mean: string;
  carbonaceousSiaFractionWinter: string;
  criticalPrecursorInsight: string;
  scientificCausalityNotice: string;
  sectors: SourceSectorApportionment[];
}

export class SourceApportionmentService {
  getSourceAnalysis(city: string = "Kanpur"): SourceAnalysisResult {
    // Exact figures cited from Page 4-5 of the Research Paper:
    // Kanpur Summer PM2.5: 78 ± 23 µg/m³, Winter PM2.5: 238 ± 96 µg/m³
    const sectors: SourceSectorApportionment[] = [
      {
        sector: "Vehicular Exhaust & Decentralized DG Sets",
        chemicalFingerprint: "Elemental Carbon (EC), Organic Carbon (OC), High Ground-Level NOx flux",
        typicalGroundLevelProfile: "Internal combustion fleets, stop-and-go congestion, diesel generators. Responsible for up to 78% of direct ground-level urban NOx.",
        summerContributionRange: [7.1, 9.0],
        winterContributionRange: [24.5, 29.9],
        currentEstimatedContributionPct: 27.2,
        evidenceTier: "Optical Carbon Speciation (EC/OC)",
        actionableMitigation: "Deploy dynamic commercial vehicle bypass diversions 12 hours prior to atmospheric stagnation; enforce ban on decentralized diesel generator sets.",
      },
      {
        sector: "Secondary Inorganic Aerosols (SIA)",
        chemicalFingerprint: "Sulfate (SO4 2-), Nitrate (NO3 -), Ammonium (NH4 +)",
        typicalGroundLevelProfile: "Formed via regional oxidation of gaseous precursor plumes (SO2, NOx, NH3) under elevated nocturnal relative humidity (>70%).",
        summerContributionRange: [9.7, 15.0],
        winterContributionRange: [18.7, 30.0],
        currentEstimatedContributionPct: 24.8,
        evidenceTier: "Formal Chemical Mass Balance / PMF Receptor Study",
        actionableMitigation: "Precursor gas abatement targeting regional industrial SO2 and morning urban NOx to suppress nocturnal ammonium nitrate condensation.",
      },
      {
        sector: "Secondary Organic Aerosols (SOA)",
        chemicalFingerprint: "Complex oxygenated polycyclic aromatic hydrocarbons (O-PAHs), oxidized NMVOCs",
        typicalGroundLevelProfile: "Driven by anthropogenic VOC condensational growth and photochemical daytime aging.",
        summerContributionRange: [8.7, 15.5],
        winterContributionRange: [16.8, 17.9],
        currentEstimatedContributionPct: 17.1,
        evidenceTier: "Formal Chemical Mass Balance / PMF Receptor Study",
        actionableMitigation: "Control industrial solvent evaporation and fugitive hydrocarbon emissions from paint, chemical, and petrochemical facilities.",
      },
      {
        sector: "Soil, Road, & Construction Dust",
        chemicalFingerprint: "Crustal mineral elements (Silicon Si, Aluminum Al, Iron Fe, Calcium Ca), fugitive coarse fraction",
        typicalGroundLevelProfile: "Mechanical shear suspension from vehicular turbulence on unswept roads; silt loadings frequently exceeding 2 to 12 g/m².",
        summerContributionRange: [21.9, 28.0],
        winterContributionRange: [4.0, 11.7],
        currentEstimatedContributionPct: 9.4,
        evidenceTier: "Formal Chemical Mass Balance / PMF Receptor Study",
        actionableMitigation: "Shift regenerative-air vacuum sweeping and fine-droplet wet suppression to late afternoon (4-6h before thermal inversion descent).",
      },
      {
        sector: "Biomass & Municipal Solid Waste (MSW) Combustion",
        chemicalFingerprint: "Levoglucosan, Potassium (K+), Brown Carbon (BrC), Polycyclic Aromatic Hydrocarbons",
        typicalGroundLevelProfile: "Episodic transboundary agricultural crop residue (paddy stubble) burning combined with localized unorganized open trash incineration.",
        summerContributionRange: [12.0, 14.8],
        winterContributionRange: [10.9, 34.8], // Biomass (2.9-26%) + MSW (8.0-8.8%)
        currentEstimatedContributionPct: 14.2,
        evidenceTier: "Optical Carbon Speciation (EC/OC)",
        actionableMitigation: "Targeted thermal drone surveillance over peripheral agricultural belts and municipal ward-level ban enforcement on solid waste burning.",
      },
      {
        sector: "Industrial Emissions, Coal, & Fly Ash",
        chemicalFingerprint: "Heavy trace elements (Arsenic As, Selenium Se), primary sulfate particulates",
        typicalGroundLevelProfile: "Point-source industrial stacks, secondary metallurgical furnaces, brick kilns, and localized industrial coal use.",
        summerContributionRange: [3.5, 26.0],
        winterContributionRange: [5.2, 16.0],
        currentEstimatedContributionPct: 7.3,
        evidenceTier: "Formal Chemical Mass Balance / PMF Receptor Study",
        actionableMitigation: "Reschedule high-emission batch production cycles at brick kilns and metallurgical furnaces away from forecast low-dispersion windows.",
      },
    ];

    return {
      city,
      season: "Winter",
      ambientPm25Mean: "Winter: 238 ± 96 µg/m³ vs Summer: 78 ± 23 µg/m³ (as published in research paper)",
      carbonaceousSiaFractionWinter: "Combustion-derived carbonaceous aerosols (EC + OC) and secondary inorganic particles account for ~61% of total PM2.5 mass during winter stagnation.",
      criticalPrecursorInsight: "Ground-level internal combustion vehicles generate ~78% of direct urban NOx flux, acting as the limiting precursor for toxic secondary ammonium nitrate formation during cold, humid nights.",
      scientificCausalityNotice: "CRITICAL SCIENTIFIC METHODOLOGY: Statistical feature importance (such as SHAP or tree weights) and correlation matrices do not independently establish causal attribution. The sectoral values above reflect formal chemical speciation, ionic chromatography, and receptor modeling (Chemical Mass Balance / PMF) documented in research literature for the Kanpur airshed.",
      sectors,
    };
  }
}

export const sourceApportionmentService = new SourceApportionmentService();
