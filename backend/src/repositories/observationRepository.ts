import { Station, Observation, HistoricalRecord, STATIONS } from "./dataStore.js";
import { calculateAQI, calculateUSAQI } from "../utils/aqi.js";

export class ObservationRepository {
  // Generates current observation for a station based on atmospheric physics and seasonal factors
  getCurrentByStation(stationId: string, customStation?: Partial<Station>): Observation {
    const station = customStation || STATIONS.find((s) => s.id === stationId) || {
      id: stationId,
      name: "Custom Monitoring Station",
      city: "Kanpur Airshed",
      state: "Uttar Pradesh",
      lat: 26.475,
      lng: 80.32,
      elevation_m: 125,
      station_type: "CAAQMS" as const,
      operator: "AeroWard Network",
      status: "active" as const,
      silt_loading_gm2: 4.5,
      canyon_hw_ratio: 1.1,
    };
    const now = new Date();
    const hour = now.getHours();

    // Diurnal boundary layer variation:
    // Night & early morning (22:00 - 08:00): surface inversion, shallow PBLH (220 - 450m), high PM
    // Afternoon (12:00 - 16:00): strong solar insolation, deep convective PBLH (1100 - 1800m), lower PM
    const isNocturnalInversion = hour < 9 || hour >= 21;
    const basePblh = isNocturnalInversion ? 320 + ((station.elevation_m || 125) % 40) : 1250 - (hour % 3) * 60;
    
    // Station specific emission intensity modifier
    let emissionFactor = 1.0;
    const sid = (station.id || stationId).toLowerCase();
    const sname = (station.name || "").toLowerCase();
    const scity = (station.city || "").toLowerCase();
    const lat = station.lat || 26.475;
    const lng = station.lng || 80.32;
    const elev = station.elevation_m || 125;

    if (sid.includes("panki") || sname.includes("panki") || sid.includes("anand_vihar")) emissionFactor = 1.45;
    else if (sid.includes("nehru") || sname.includes("nehru") || sid.includes("kalyanpur")) emissionFactor = 1.25;
    else if (sid.includes("iitk") || sname.includes("iit") || sid.includes("bhu")) emissionFactor = 0.78;
    else if (station.silt_loading_gm2 && station.silt_loading_gm2 > 5.0) emissionFactor = 1.35;
    else if (station.canyon_hw_ratio && station.canyon_hw_ratio > 1.2) emissionFactor = 1.3;

    // Regional Topographical Airshed Domain:
    let airshedType: "IGP_CRITICAL" | "DOON_VALLEY_FOOTHILL" | "HIMALAYAN_HIGHLAND" | "COASTAL_MARINE" | "PENINSULAR_PLATEAU" = "IGP_CRITICAL";
    if (scity.includes("dehradun") || sname.includes("dehradun") || (lat >= 29.8 && lat <= 30.6 && lng >= 77.8 && lng <= 78.6)) {
      airshedType = "DOON_VALLEY_FOOTHILL";
    } else if (elev > 1000 || scity.includes("shillong") || scity.includes("shimla") || scity.includes("srinagar") || scity.includes("leh")) {
      airshedType = "HIMALAYAN_HIGHLAND";
    } else if (scity.includes("mumbai") || scity.includes("chennai") || scity.includes("kochi") || scity.includes("visakhapatnam") || (lat < 21.0 && (lng < 74.0 || lng > 80.0))) {
      airshedType = "COASTAL_MARINE";
    } else if (lat < 24.0) {
      airshedType = "PENINSULAR_PLATEAU";
    }

    // Authentic regional baseline PM2.5 (adjusted for topography, airshed ventilation, and ground CAAQMS truth)
    let regionalBasePm25 = 108;
    let regionalBasePm10Multiplier = 1.65;
    if (airshedType === "DOON_VALLEY_FOOTHILL") {
      // Dehradun Doon Valley: elevation ~640m, Himalayan foothill drainage, clean mountain ventilation
      regionalBasePm25 = isNocturnalInversion ? 21 : 18;
      regionalBasePm10Multiplier = 1.8;
    } else if (airshedType === "HIMALAYAN_HIGHLAND") {
      // Pristine mountain air (Shillong, Shimla): authentic NAQI ~20-50
      regionalBasePm25 = isNocturnalInversion ? 20 : 14;
      regionalBasePm10Multiplier = 1.4;
    } else if (airshedType === "COASTAL_MARINE") {
      // Coastal marine breeze dispersion (Mumbai): authentic NAQI ~80-105
      regionalBasePm25 = isNocturnalInversion ? 52 : 42;
      regionalBasePm10Multiplier = 1.5;
    } else if (airshedType === "PENINSULAR_PLATEAU") {
      regionalBasePm25 = isNocturnalInversion ? 60 : 48;
      regionalBasePm10Multiplier = 1.55;
    } else {
      // Indo-Gangetic Basin Airshed (Kanpur, Lucknow, Delhi, Patna):
      // Active wet precipitation deposition & moisture scavenging (rain washout drops PM2.5 to 18-24 µg/m³)
      regionalBasePm25 = (lat > 37.5 || lat < 8.0 || lng < 68.0 || lng > 97.5) ? (isNocturnalInversion ? 14 : 10) : (isNocturnalInversion ? 145 : 105);
      regionalBasePm10Multiplier = (lat > 37.5 || lat < 8.0 || lng < 68.0 || lng > 97.5) ? 1.4 : 1.65;
    }

    const basePm25 = regionalBasePm25 * emissionFactor;
    const pm25 = Math.round(basePm25 + (Math.sin(hour / 3) * 4));
    const pm10 = Math.round(pm25 * regionalBasePm10Multiplier + (airshedType === "DOON_VALLEY_FOOTHILL" ? 8 : 20));
    const no2 = Math.round((isNocturnalInversion ? (airshedType === "IGP_CRITICAL" ? 68 : 36) : (airshedType === "IGP_CRITICAL" ? 42 : 26)) * emissionFactor);
    const so2 = Math.round((airshedType === "IGP_CRITICAL" ? 18 : 10) * emissionFactor);
    const co = Number(((isNocturnalInversion ? 1.4 : 0.8) * (airshedType === "IGP_CRITICAL" ? 1.2 : 0.8) * emissionFactor).toFixed(2));
    const o3 = Math.round(isNocturnalInversion ? 22 : 54);

    const aqiResult = calculateAQI({ pm25, pm10, no2, so2, co, o3 });
    const usa = calculateUSAQI(pm25);

    return {
      id: `obs_${stationId}_${now.getTime()}`,
      stationId: stationId,
      recordedAt: now.toISOString(),
      pm25,
      pm10,
      no2,
      so2,
      co,
      o3,
      aqi: aqiResult.aqi,
      category: aqiResult.category,
      us_aqi: usa.usAqi,
      us_category: usa.usCategory,
      dominantPollutant: aqiResult.dominantPollutant,
      dataQuality: "simulated",
      meteorology: {
        temp_c: Number((23 - Math.sin(hour / 4) * 5).toFixed(1)),
        rh_pct: Math.round(isNocturnalInversion ? 76 : 48),
        wind_speed_ms: Number((isNocturnalInversion ? 1.2 : 2.8).toFixed(1)),
        wind_dir_deg: 295, // Synoptic WNW flow
        pblh_m: basePblh,
        inversion_strength_c100m: isNocturnalInversion ? 2.8 : 0.4,
        solar_rad_wm2: isNocturnalInversion ? 0 : 540,
      },
      satellite: {
        tropomi_aai: 1.68,
        aod_550nm: 0.82,
        tropomi_no2_column_umol_m2: 245.0,
      },
    };
  }

  getAllCurrent(): Observation[] {
    return STATIONS.map((station) => this.getCurrentByStation(station.id, station));
  }

  // Realistic Historical Time-Series with Autocorrelation and Episodic Anomaly Modeling
  getHistorical(
    stationId: string = "kanpur_iitk",
    days: number = 30,
    customStation?: Station
  ): HistoricalRecord[] {
    const station = customStation || STATIONS.find((s) => s.id === stationId) || STATIONS[0];
    const now = new Date();
    const records: HistoricalRecord[] = [];

    // Station specific modifier
    let emissionFactor = 1.0;
    if (station.id.includes("panki") || station.id.includes("anand_vihar")) emissionFactor = 1.35;
    else if (station.id.includes("nehru") || station.id.includes("kalyanpur")) emissionFactor = 1.2;
    else if (station.id.includes("iitk") || station.id.includes("bhu")) emissionFactor = 0.82;

    const totalPoints = days * 4; // 6-hourly intervals (00:00, 06:00, 12:00, 18:00)

    // Autoregressive baseline state
    let arState = 140 * emissionFactor;

    for (let i = totalPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 6 * 3600000);
      const dayOffset = Math.floor(i / 4); // Days ago
      const hour = timestamp.getHours();
      const isNight = hour === 0 || hour === 6;

      // Deterministic episodic intervals based on relative day position
      // Continuous atmospheric dynamic envelopes:
      // 1. Post-monsoon Stubble Burning Plume (peaks around day 24 with realistic Gaussian dispersion width)
      const stubbleEnvelope = Math.exp(-0.5 * Math.pow((dayOffset - 24) / 2.2, 2));

      // 2. Western Disturbance Washout (rapid scavenging on day 15.5, gradual recovery over 2 days)
      const washoutEnvelope = Math.exp(-0.5 * Math.pow((dayOffset - 15.5) / 1.1, 2));

      // 3. Acute Winter Radiational Inversion (days 8-11, strong nocturnal boundary layer trap)
      const inversionEnvelope = Math.exp(-0.5 * Math.pow((dayOffset - 9.5) / 1.8, 2));

      // 4. Pre-Monsoon Crustal Dust Surge (days 2-3, coarse mineral advection)
      const dustEnvelope = Math.exp(-0.5 * Math.pow((dayOffset - 2.5) / 1.0, 2));

      let pm25 = 0;
      let pm10 = 0;
      let no2 = 0;
      let so2 = 0;
      let co = 0;
      let o3 = 0;
      let pblh_m = 0;
      let wind_speed_ms = 0;
      const events: string[] = [];

      // Organic stochastic noise with day-to-day weather autocorrelation (AR(1) model)
      const pseudoRandom = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const noise = (pseudoRandom - Math.floor(pseudoRandom) - 0.5) * 16;
      arState = 0.84 * arState + 0.16 * (135 * emissionFactor) + noise * 0.35;

      // Diurnal boundary layer variation: nocturnal compression vs daytime convective mixing
      const diurnalDiff = isNight ? 24 : -18;
      let basePm = (arState + diurnalDiff) * emissionFactor;

      // Wet deposition washout reduction
      if (washoutEnvelope > 0.05) {
        basePm = basePm * (1 - 0.72 * washoutEnvelope);
        if (washoutEnvelope > 0.35) {
          events.push("Western Disturbance Precipitation Scavenging & Atmospheric Washout (-78% PM Clearance)");
        }
      }

      // Stubble burning smoke plume injection
      let smokeAddition = 0;
      if (stubbleEnvelope > 0.04) {
        const diurnalSmokeMod = isNight ? 1.35 : 0.88;
        smokeAddition = stubbleEnvelope * 220 * diurnalSmokeMod * emissionFactor;
        if (stubbleEnvelope > 0.28) {
          events.push("Transboundary Agricultural Stubble Burning Plume (Elevated TROPOMI UVAI > 2.2)");
        }
      }

      // Nocturnal radiational inversion trapping
      let inversionAddition = 0;
      if (inversionEnvelope > 0.05) {
        const invEffect = isNight ? 1.55 : 0.82;
        inversionAddition = inversionEnvelope * 105 * invEffect * emissionFactor;
        if (inversionEnvelope > 0.32 && isNight) {
          events.push("Nocturnal Radiational Thermal Inversion (Boundary Layer Compressed < 220m)");
        }
      }

      // Total PM2.5 calculation
      pm25 = Math.max(22, Math.round(basePm + smokeAddition + inversionAddition + noise * 0.25));

      // Dust surge primarily elevates coarse PM10 with low PM2.5 ratio
      if (dustEnvelope > 0.08) {
        pm10 = Math.round((pm25 * 1.5 + dustEnvelope * 280) * emissionFactor);
        if (dustEnvelope > 0.35) {
          events.push("Pre-Monsoon Crustal Dust Suspension (Thar Desert Long-Range Advection)");
        }
      } else {
        pm10 = Math.round(pm25 * 1.62 + 20);
      }

      // Chemistry tracers
      no2 = Math.round((isNight ? 58 : 38) * emissionFactor + (stubbleEnvelope * 22) + (inversionEnvelope * 26));
      so2 = Math.round(16 * emissionFactor + (stubbleEnvelope * 6));
      co = Number(((isNight ? 1.6 : 0.9) * emissionFactor + (stubbleEnvelope * 1.4)).toFixed(2));
      o3 = Math.round(isNight ? 18 : 62);

      // Meteorology variables
      pblh_m = Math.round(
        (isNight ? 280 : 1250) - (inversionEnvelope * 120) + (washoutEnvelope * 200)
      );
      wind_speed_ms = Number(
        ((washoutEnvelope > 0.2 ? 4.8 : isNight ? 1.2 : 2.6) + Math.abs(noise) * 0.02).toFixed(1)
      );

      const aqiRes = calculateAQI({ pm25, pm10, no2, so2, co, o3 });

      records.push({
        date: timestamp.toISOString(),
        stationId: station.id,
        city: station.city,
        pm25,
        pm10,
        no2,
        so2,
        co,
        o3,
        aqi: aqiRes.aqi,
        pblh_m,
        wind_speed_ms,
        events: events.length > 0 ? events : undefined,
      });
    }

    return records;
  }

  // Returns GeoJSON FeatureCollection for MapLibre GL JS
  getGeoJSON(): GeoJSON.FeatureCollection {
    const observations = this.getAllCurrent();
    return {
      type: "FeatureCollection",
      features: observations.map((obs) => {
        const station = STATIONS.find((s) => s.id === obs.stationId)!;
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [station.lng, station.lat],
          },
          properties: {
            stationId: station.id,
            name: station.name,
            city: station.city,
            state: station.state,
            elevation_m: station.elevation_m,
            station_type: station.station_type,
            operator: station.operator,
            status: station.status,
            silt_loading_gm2: station.silt_loading_gm2,
            canyon_hw_ratio: station.canyon_hw_ratio,
            canyon_btr: station.canyon_btr,
            pm25: obs.pm25,
            pm10: obs.pm10,
            no2: obs.no2,
            so2: obs.so2,
            co: obs.co,
            o3: obs.o3,
            aqi: obs.aqi,
            category: obs.category,
            dominantPollutant: obs.dominantPollutant,
            wind_speed_ms: obs.meteorology.wind_speed_ms,
            wind_dir_deg: obs.meteorology.wind_dir_deg,
            pblh_m: obs.meteorology.pblh_m,
            inversion_strength: obs.meteorology.inversion_strength_c100m,
            tropomi_aai: obs.satellite.tropomi_aai,
            aod_550nm: obs.satellite.aod_550nm,
            recordedAt: obs.recordedAt,
          },
        };
      }),
    };
  }
}

export const observationRepository = new ObservationRepository();
