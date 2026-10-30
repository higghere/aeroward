export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  elevation_m: number;
  station_type: "CAAQMS" | "Research_SuperSite" | "Micro_Sensor";
  operator: string;
  status: "active" | "maintenance" | "offline";
  silt_loading_gm2?: number;
  canyon_hw_ratio?: number;
  canyon_btr?: number;
}

export interface Observation {
  id: string;
  stationId: string;
  recordedAt: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  aqi: number;
  category: string;
  us_aqi?: number;
  us_category?: string;
  dominantPollutant: string;
  dataQuality: "validated" | "raw" | "flagged" | "synthetic";
  meteorology: {
    temp_c: number;
    rh_pct: number;
    wind_speed_ms: number;
    wind_dir_deg: number;
    pblh_m: number;
    inversion_strength_c100m: number;
    solar_rad_wm2: number;
  };
  satellite: {
    tropomi_aai: number;
    aod_550nm: number;
    tropomi_no2_column_umol_m2: number;
  };
}

export interface HistoricalRecord {
  date: string;
  stationId: string;
  city: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  aqi: number;
  pblh_m: number;
  wind_speed_ms: number;
  events?: string[];
}

export const STATIONS: Station[] = [
  {
    id: "kanpur_iitk",
    name: "IIT Kanpur (Aerosol Research SuperSite)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.5123,
    lng: 80.2329,
    elevation_m: 126,
    station_type: "Research_SuperSite",
    operator: "IIT Kanpur / CPCB",
    status: "active",
    silt_loading_gm2: 1.4,
    canyon_hw_ratio: 0.4,
    canyon_btr: 0.35,
  },
  {
    id: "kanpur_nehru",
    name: "Nehru Nagar (Urban Commercial & Transit)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4712,
    lng: 80.3244,
    elevation_m: 125,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 6.8, // Heavy silt load above 2 g/m^2 trigger
    canyon_hw_ratio: 1.42, // Deep street canyon
    canyon_btr: 0.86,     // High build-to-line ratio
  },
  {
    id: "kanpur_kidwai",
    name: "Kidwai Nagar (High-Density Residential)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4385,
    lng: 80.3392,
    elevation_m: 124,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 4.2,
    canyon_hw_ratio: 1.15,
    canyon_btr: 0.78,
  },
  {
    id: "kanpur_panki",
    name: "Panki Industrial Area (Thermal & Heavy Manufacturing)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4678,
    lng: 80.2456,
    elevation_m: 128,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 8.5,
    canyon_hw_ratio: 0.65,
    canyon_btr: 0.45,
  },
  {
    id: "kanpur_jajmau",
    name: "Jajmau (Tannery & Leather Industrial Cluster)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4312,
    lng: 80.4011,
    elevation_m: 122,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 5.6,
    canyon_hw_ratio: 0.95,
    canyon_btr: 0.70,
  },
  {
    id: "kanpur_kalyanpur",
    name: "Kalyanpur (GT Road Arterial Corridor)",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4950,
    lng: 80.2600,
    elevation_m: 126,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 7.2,
    canyon_hw_ratio: 1.25,
    canyon_btr: 0.82,
  },
  {
    id: "delhi_anand_vihar",
    name: "Anand Vihar (ISBT & Railway Terminal)",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6469,
    lng: 77.3160,
    elevation_m: 213,
    station_type: "CAAQMS",
    operator: "DPCC / CPCB",
    status: "active",
    silt_loading_gm2: 9.1,
    canyon_hw_ratio: 1.35,
    canyon_btr: 0.85,
  },
  {
    id: "lucknow_talkatora",
    name: "Talkatora Industrial District",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8322,
    lng: 80.8925,
    elevation_m: 123,
    station_type: "CAAQMS",
    operator: "UPPCB / CPCB",
    status: "active",
    silt_loading_gm2: 5.1,
    canyon_hw_ratio: 1.05,
    canyon_btr: 0.72,
  },
  {
    id: "varanasi_bhu",
    name: "Banaras Hindu University (Campus SuperSite)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.2677,
    lng: 82.9913,
    elevation_m: 81,
    station_type: "Research_SuperSite",
    operator: "BHU / UPPCB",
    status: "active",
    silt_loading_gm2: 1.8,
    canyon_hw_ratio: 0.35,
    canyon_btr: 0.3,
  },
  {
    id: "patna_muradpur",
    name: "Muradpur (Central Ganges Basin)",
    city: "Patna",
    state: "Bihar",
    lat: 25.6186,
    lng: 85.1588,
    elevation_m: 53,
    station_type: "CAAQMS",
    operator: "BSPCB / CPCB",
    status: "active",
    silt_loading_gm2: 6.0,
    canyon_hw_ratio: 1.18,
    canyon_btr: 0.81,
  },
];

export const DATA_SOURCES_REGISTRY = [
  {
    id: "cpcb-caaqms",
    provider: "Central Pollution Control Board (CPCB) / State PCBs",
    dataset: "Continuous Ambient Air Quality Monitoring Stations (CAAQMS)",
    measurementType: "In-situ continuous physical telemetry (BAM-1020, TEOM, chemiluminescence)",
    temporalResolution: "15-minute raw / 1-hour QA/QC validated",
    spatialScope: "Station point coordinate (sub-kilometer representative footprint)",
    lastIngestedAt: new Date().toISOString(),
    status: "operational",
    provenanceNote: "Ground-level verified observations. Filter tape attenuation calibrated against gravimetric reference samples.",
  },
  {
    id: "copernicus-sentinel-5p",
    provider: "European Space Agency (ESA) Copernicus Programme",
    dataset: "Sentinel-5P TROPOMI Level-2 Offline Aerosol Index & Tropospheric NO2 Column",
    measurementType: "Spaceborne Ultraviolet Absorbing Aerosol Index (AAI: 340/380 nm spectral contrast)",
    temporalResolution: "Daily overpass (~13:30 local solar time)",
    spatialScope: "3.5 km x 5.5 km pixel resolution",
    lastIngestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "operational",
    provenanceNote: "Total atmospheric column density. High positive values indicate elevated UV-absorbing aerosols (smoke & dust). Not direct street-level PM2.5.",
  },
  {
    id: "ecmwf-era5-nwp",
    provider: "ECMWF / Copernicus Climate Change Service",
    dataset: "ERA5 Reanalysis & Global Forecast System (GFS) NWP",
    measurementType: "Numerical Boundary Layer Height (PBLH), synoptic wind advection vectors, thermal lapse rate",
    temporalResolution: "Hourly forecast updates (00Z, 06Z, 12Z, 18Z cycles)",
    spatialScope: "0.25° x 0.25° global grid (downscaled with local aerodynamic surface roughness)",
    lastIngestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "operational",
    provenanceNote: "Synoptic thermodynamic boundary conditions used to compute aerosol-radiation-meteorological feedback.",
  },
  {
    id: "iitk-source-apportionment",
    provider: "Indian Institute of Technology Kanpur (IITK) & UPPCB",
    dataset: "Comprehensive Air Quality Assessment, Receptor Modeling & Chemical Mass Balance (CMB/PMF)",
    measurementType: "Optical carbon speciation (EC/OC), ionic chromatography (SIA), XRF trace metals",
    temporalResolution: "Seasonal regimes (Summer vs Winter campaigns)",
    spatialScope: "Kanpur airshed and central Indo-Gangetic Basin",
    lastIngestedAt: new Date().toISOString(),
    status: "reference-groundtruth",
    provenanceNote: "Scientific research baseline published in UPPCB/IITK source apportionment reports and literature cited in the blueprint.",
  },
];
