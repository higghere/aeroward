import { Station, Observation, HistoricalRecord, STATIONS } from "./dataStore.js";
import { calculateAQI } from "../utils/aqi.js";

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
    if (sid.includes("panki") || sname.includes("panki") || sid.includes("anand_vihar")) emissionFactor = 1.45;
    else if (sid.includes("nehru") || sname.includes("nehru") || sid.includes("kalyanpur")) emissionFactor = 1.25;
    else if (sid.includes("iitk") || sname.includes("iit") || sid.includes("bhu")) emissionFactor = 0.78;
    else if (station.silt_loading_gm2 && station.silt_loading_gm2 > 5.0) emissionFactor = 1.35;
    else if (station.canyon_hw_ratio && station.canyon_hw_ratio > 1.2) emissionFactor = 1.3;

    // Winter/post-monsoon transitional base values (Indo-Gangetic Plain baseline)
    const basePm25 = isNocturnalInversion ? 185 * emissionFactor : 108 * emissionFactor;
    const pm25 = Math.round(basePm25 + (Math.sin(hour / 3) * 15));
    const pm10 = Math.round(pm25 * 1.65 + 25);
    const no2 = Math.round((isNocturnalInversion ? 68 : 42) * emissionFactor);
    const so2 = Math.round(18 * emissionFactor);
    const co = Number((isNocturnalInversion ? 1.8 * emissionFactor : 0.9 * emissionFactor).toFixed(2));
    const o3 = Math.round(isNocturnalInversion ? 22 : 64); // Ozone peaks in afternoon with sunlight

    const aqiResult = calculateAQI({ pm25, pm10, no2, so2, co, o3 });

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
      dominantPollutant: aqiResult.dominantPollutant,
      dataQuality: "validated",
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
  getHistorical(stationId: string = "kanpur_iitk", days: number = 30): HistoricalRecord[] {
    const station = STATIONS.find((s) => s.id === stationId) || STATIONS[0];
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
      // Episodic Event 1: Post-monsoon Stubble Burning Plume (occurred ~22-26 days ago)
      const isStubbleBurningPlume = dayOffset >= 22 && dayOffset <= 26;

      // Episodic Event 2: Western Disturbance Rain Washout (occurred ~15-16 days ago)
      const isRainWashout = dayOffset >= 15 && dayOffset <= 16;

      // Episodic Event 3: Acute Winter Thermal Inversion & Radiational Fog (occurred ~8-11 days ago)
      const isSevereInversion = dayOffset >= 8 && dayOffset <= 11;

      // Episodic Event 4: Pre-Monsoon Crustal Dust Surge (occurred ~2-3 days ago)
      const isDustSurge = dayOffset >= 2 && dayOffset <= 3;

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
      const noise = (pseudoRandom - Math.floor(pseudoRandom) - 0.5) * 22;
      arState = 0.82 * arState + 0.18 * (145 * emissionFactor) + noise * 0.4;

      if (isStubbleBurningPlume) {
        // High absorbing smoke: intense submicron PM2.5 spike, elevated CO and NO2
        const plumeIntensity = Math.sin(((dayOffset - 22) / 4) * Math.PI);
        pm25 = Math.round((280 + plumeIntensity * 160 + noise * 0.5) * emissionFactor);
        pm10 = Math.round(pm25 * 1.35 + 20);
        no2 = Math.round((65 + plumeIntensity * 28) * emissionFactor);
        so2 = 24;
        co = Number((2.2 + plumeIntensity * 1.4).toFixed(2));
        o3 = Math.round(isNight ? 16 : 45);
        pblh_m = isNight ? 240 : 850;
        wind_speed_ms = Number((1.1 + Math.abs(noise) * 0.02).toFixed(1));
        events.push("Transboundary Agricultural Stubble Burning Plume (Elevated TROPOMI UVAI > 2.2)");
      } else if (isRainWashout) {
        // Western disturbance precipitation: dramatic aerosol clearance down to clean air
        pm25 = Math.round((36 + Math.abs(noise) * 0.5) * emissionFactor);
        pm10 = Math.round(pm25 * 1.4 + 10);
        no2 = Math.round(22 * emissionFactor);
        so2 = 8;
        co = 0.5;
        o3 = 28;
        pblh_m = isNight ? 450 : 980;
        wind_speed_ms = Number((4.6 + Math.abs(noise) * 0.05).toFixed(1));
        events.push("Western Disturbance Precipitation Scavenging & Atmospheric Washout (-78% PM Clearance)");
      } else if (isSevereInversion) {
        // Extreme winter radiational inversion: nocturnal trap, shallow mixing
        const invMultiplier = isNight ? 1.6 : 0.85;
        pm25 = Math.round((210 * invMultiplier + noise * 0.6) * emissionFactor);
        pm10 = Math.round(pm25 * 1.55 + 30);
        no2 = Math.round((isNight ? 82 : 48) * emissionFactor);
        so2 = 26;
        co = Number((isNight ? 2.4 : 1.1).toFixed(2));
        o3 = Math.round(isNight ? 12 : 52);
        pblh_m = isNight ? 190 : 720;
        wind_speed_ms = Number((0.8 + Math.abs(noise) * 0.02).toFixed(1));
        events.push("Nocturnal Radiational Thermal Inversion (Boundary Layer Compressed < 220m)");
      } else if (isDustSurge) {
        // Pre-monsoon mineral dust surge: elevated coarse PM10, but stable/lower NO2
        pm10 = Math.round((460 + Math.abs(noise) * 6) * emissionFactor);
        pm25 = Math.round(pm10 * 0.32 + noise * 0.3); // Low PM2.5/PM10 fraction (~0.32) indicative of crustal dust
        no2 = Math.round(38 * emissionFactor); // Combustion tracer does NOT spike
        so2 = 14;
        co = 0.85;
        o3 = Math.round(isNight ? 26 : 74);
        pblh_m = isNight ? 700 : 1750;
        wind_speed_ms = Number((5.8 + Math.abs(noise) * 0.08).toFixed(1));
        events.push("Pre-Monsoon Crustal Dust Suspension (Thar Desert Long-Range Advection)");
      } else {
        // Baseline diurnal atmospheric physics:
        // Night inversion (compression + space heating) vs afternoon solar convective mixing
        const diurnalFactor = isNight ? 1.28 : 0.82;
        pm25 = Math.max(25, Math.round(arState * diurnalFactor + noise));
        pm10 = Math.round(pm25 * 1.58 + 25);
        no2 = Math.round((isNight ? 52 : 36) * emissionFactor);
        so2 = Math.round(16 * emissionFactor);
        co = Number(((isNight ? 1.4 : 0.8) * emissionFactor).toFixed(2));
        o3 = Math.round(isNight ? 22 : 62);
        pblh_m = isNight ? 310 : 1240;
        wind_speed_ms = Number(((isNight ? 1.2 : 2.6) + Math.abs(noise) * 0.03).toFixed(1));
      }

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
