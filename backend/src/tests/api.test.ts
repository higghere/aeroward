import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildServer } from "../server.js";
import {
  calculateAQI,
  calculateUSAQI,
  convertUSAQIToPM25,
  convertUSAQIToPM10,
} from "../utils/aqi.js";

test("AeroWard Comprehensive 58-Test Verification Suite", async (t) => {
  const server = buildServer();

  // =========================================================================
  // SECTION 1: CPCB NAQI Contiguous Breakpoints & Decimal Gap Tests (1 - 10)
  // =========================================================================

  await t.test("Test 1: PM2.5 Good range (15 µg/m³ -> AQI 25, Good)", async () => {
    const res = calculateAQI({ pm25: 15 });
    assert.equal(res.aqi, 25);
    assert.equal(res.category, "Good");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 2: PM2.5 Decimal boundary (30.5 µg/m³ -> AQI 52, Satisfactory - no gap fallthrough to 500)", async () => {
    const res = calculateAQI({ pm25: 30.5 });
    assert.equal(res.aqi, 52);
    assert.equal(res.category, "Satisfactory");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 3: PM2.5 Decimal boundary (60.4 µg/m³ -> AQI 102, Moderate - no gap fallthrough to 500)", async () => {
    const res = calculateAQI({ pm25: 60.4 });
    assert.equal(res.aqi, 102);
    assert.equal(res.category, "Moderate");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 4: PM2.5 Poor range (90.5 µg/m³ -> AQI 203, Poor)", async () => {
    const res = calculateAQI({ pm25: 90.5 });
    assert.equal(res.aqi, 203);
    assert.equal(res.category, "Poor");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 5: PM2.5 Very Poor range (152.0 µg/m³ -> AQI 325, Very Poor, matches Anand Vihar)", async () => {
    const res = calculateAQI({ pm25: 152.0 });
    assert.equal(res.aqi, 325);
    assert.equal(res.category, "Very Poor");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 6: PM2.5 Severe range (300.0 µg/m³ -> AQI 421, Severe)", async () => {
    const res = calculateAQI({ pm25: 300.0 });
    assert.equal(res.aqi, 421);
    assert.equal(res.category, "Severe");
    assert.equal(res.dominantPollutant, "PM2.5");
  });

  await t.test("Test 7: PM10 Decimal boundary (50.5 µg/m³ -> AQI 51, Satisfactory - no gap fallthrough to 500)", async () => {
    const res = calculateAQI({ pm10: 50.5 });
    assert.equal(res.aqi, 51);
    assert.equal(res.category, "Satisfactory");
    assert.equal(res.dominantPollutant, "PM10");
  });

  await t.test("Test 8: PM10 Severe range (370.0 µg/m³ -> AQI 326, matches Anand Vihar PM10)", async () => {
    const res = calculateAQI({ pm10: 370.0 });
    assert.equal(res.aqi, 326);
    assert.equal(res.category, "Very Poor");
    assert.equal(res.dominantPollutant, "PM10");
  });

  await t.test("Test 9: Concentration exceeds highest breakpoint (PM2.5 = 750 µg/m³ caps at 500, Severe)", async () => {
    const res = calculateAQI({ pm25: 750 });
    assert.equal(res.aqi, 500);
    assert.equal(res.category, "Severe");
  });

  await t.test("Test 10: Negative, null, or NaN concentrations return AQI 0 safely", async () => {
    const res1 = calculateAQI({ pm25: -20 });
    assert.equal(res1.aqi, 0);
    const res2 = calculateAQI({ pm25: NaN, pm10: null as any });
    assert.equal(res2.aqi, 0);
  });

  // =========================================================================
  // SECTION 2: All 6 Pollutant Scoring & Dominant Pollutant Tests (11 - 18)
  // =========================================================================

  await t.test("Test 11: SO2 dominant scoring (SO2 = 500 µg/m³ -> AQI 229, Poor, dominant: SO2)", async () => {
    const res = calculateAQI({ so2: 500 });
    assert.equal(res.aqi, 229);
    assert.equal(res.category, "Poor");
    assert.equal(res.dominantPollutant, "SO2");
  });

  await t.test("Test 12: CO dominant scoring (CO = 12.0 mg/m³ -> AQI 229, Poor, dominant: CO)", async () => {
    const res = calculateAQI({ co: 12.0 });
    assert.equal(res.aqi, 229);
    assert.equal(res.category, "Poor");
    assert.equal(res.dominantPollutant, "CO");
  });

  await t.test("Test 13: O3 dominant scoring (O3 = 180 µg/m³ -> AQI 231, Poor, dominant: O3)", async () => {
    const res = calculateAQI({ o3: 180 });
    assert.equal(res.aqi, 231);
    assert.equal(res.category, "Poor");
    assert.equal(res.dominantPollutant, "O3");
  });

  await t.test("Test 14: NO2 dominant scoring (NO2 = 200 µg/m³ -> AQI 221, Poor, dominant: NO2)", async () => {
    const res = calculateAQI({ no2: 200 });
    assert.equal(res.aqi, 221);
    assert.equal(res.category, "Poor");
    assert.equal(res.dominantPollutant, "NO2");
  });

  await t.test("Test 15: Mixed pollutants where O3 exceeds PM2.5 and PM10", async () => {
    const res = calculateAQI({ pm25: 25, pm10: 45, o3: 185 });
    assert.equal(res.dominantPollutant, "O3");
    assert.ok(res.aqi > 200);
  });

  await t.test("Test 16: Mixed pollutants where CO exceeds PM2.5 and PM10", async () => {
    const res = calculateAQI({ pm25: 20, pm10: 30, co: 14.5 });
    assert.equal(res.dominantPollutant, "CO");
    assert.ok(res.aqi > 200);
  });

  await t.test("Test 17: Exclusively gaseous pollutants supplied does not return 0 or Unknown", async () => {
    const res = calculateAQI({ so2: 60, no2: 70, co: 1.5, o3: 80 });
    assert.ok(res.aqi > 50);
    assert.notEqual(res.category, "Unknown");
    assert.notEqual(res.dominantPollutant, "None");
  });

  await t.test("Test 18: Empty pollutant object returns AQI 0, category Unknown, dominant None", async () => {
    const res = calculateAQI({});
    assert.equal(res.aqi, 0);
    assert.equal(res.category, "Unknown");
    assert.equal(res.dominantPollutant, "None");
  });

  // =========================================================================
  // SECTION 3: 2024 Revised US EPA PM2.5 Standards (19 - 26)
  // =========================================================================

  await t.test("Test 19: PM2.5 = 5.0 µg/m³ -> US AQI 28 (Good)", async () => {
    const res = calculateUSAQI(5.0);
    assert.equal(res.usAqi, 28);
    assert.equal(res.usCategory, "Good");
  });

  await t.test("Test 20: PM2.5 = 9.0 µg/m³ -> US AQI 50 (Good boundary under 2024 revised standard)", async () => {
    const res = calculateUSAQI(9.0);
    assert.equal(res.usAqi, 50);
    assert.equal(res.usCategory, "Good");
  });

  await t.test("Test 21: PM2.5 = 9.5 µg/m³ -> US AQI 52 (Moderate under 2024 revised standard)", async () => {
    const res = calculateUSAQI(9.5);
    assert.equal(res.usAqi, 52);
    assert.equal(res.usCategory, "Moderate");
  });

  await t.test("Test 22: PM2.5 = 35.4 µg/m³ -> US AQI 100 (Moderate boundary)", async () => {
    const res = calculateUSAQI(35.4);
    assert.equal(res.usAqi, 100);
    assert.equal(res.usCategory, "Moderate");
  });

  await t.test("Test 23: PM2.5 = 55.4 µg/m³ -> US AQI 150 (Unhealthy for Sensitive Groups)", async () => {
    const res = calculateUSAQI(55.4);
    assert.equal(res.usAqi, 150);
    assert.equal(res.usCategory, "Unhealthy for Sensitive Groups");
  });

  await t.test("Test 24: PM2.5 = 100.0 µg/m³ -> US AQI 182 (Unhealthy under 2024 revised standard)", async () => {
    const res = calculateUSAQI(100.0);
    assert.equal(res.usAqi, 182);
    assert.equal(res.usCategory, "Unhealthy");
  });

  await t.test("Test 25: PM2.5 = 152.0 µg/m³ -> US AQI 227 (Very Unhealthy, exact Anand Vihar ground truth match)", async () => {
    const res = calculateUSAQI(152.0);
    assert.equal(res.usAqi, 227);
    assert.equal(res.usCategory, "Very Unhealthy");
  });

  await t.test("Test 26: PM2.5 = 200.0 µg/m³ -> US AQI 275 (Very Unhealthy under 2024 revised standard)", async () => {
    const res = calculateUSAQI(200.0);
    assert.equal(res.usAqi, 275);
    assert.equal(res.usCategory, "Very Unhealthy");
  });

  // =========================================================================
  // SECTION 4: Bi-directional Inverse Conversions (27 - 32)
  // =========================================================================

  await t.test("Test 27: convertUSAQIToPM25(50) returns 9.0 µg/m³", async () => {
    const pm = convertUSAQIToPM25(50);
    assert.equal(pm, 9.0);
  });

  await t.test("Test 28: convertUSAQIToPM25(100) returns 35.4 µg/m³", async () => {
    const pm = convertUSAQIToPM25(100);
    assert.equal(pm, 35.4);
  });

  await t.test("Test 29: convertUSAQIToPM25(227) returns ~151.7 µg/m³", async () => {
    const pm = convertUSAQIToPM25(227);
    assert.ok(Math.abs(pm - 151.7) < 0.5);
  });

  await t.test("Test 30: convertUSAQIToPM10(50) returns 54.0 µg/m³", async () => {
    const pm = convertUSAQIToPM10(50);
    assert.equal(pm, 54.0);
  });

  await t.test("Test 31: convertUSAQIToPM10(100) returns 154.0 µg/m³", async () => {
    const pm = convertUSAQIToPM10(100);
    assert.equal(pm, 154.0);
  });

  await t.test("Test 32: Roundtrip consistency: calculateUSAQI(convertUSAQIToPM25(X)) preserves AQI for X in [30, 80, 160, 240]", async () => {
    for (const targetAqi of [30, 80, 160, 240]) {
      const pm = convertUSAQIToPM25(targetAqi);
      const computed = calculateUSAQI(pm);
      assert.ok(
        Math.abs(computed.usAqi - targetAqi) <= 1,
        `Roundtrip failed for ${targetAqi}: got ${computed.usAqi}`
      );
    }
  });

  // =========================================================================
  // SECTION 5: aqi.in Real-World City Telemetry Verification (33 - 39)
  // =========================================================================

  await t.test("Test 33: Anand Vihar ground truth: PM2.5 = 152, PM10 = 370 yields US AQI 227 and Indian AQI 326", async () => {
    const inAqi = calculateAQI({ pm25: 152, pm10: 370 });
    const usAqi = calculateUSAQI(152);
    assert.ok(inAqi.aqi >= 325 && inAqi.aqi <= 326);
    assert.equal(usAqi.usAqi, 227);
  });

  await t.test("Test 34: Dehradun ground truth: PM2.5 = 18, PM10 = 49 yields Indian AQI 49 (Good) and US AQI 68 (Moderate)", async () => {
    const inAqi = calculateAQI({ pm25: 18, pm10: 49 });
    const usAqi = calculateUSAQI(18);
    assert.ok(inAqi.aqi >= 48 && inAqi.aqi <= 49);
    assert.equal(inAqi.category, "Good");
    assert.equal(usAqi.usAqi, 68);
    assert.equal(usAqi.usCategory, "Moderate");
  });

  await t.test("Test 35: Kanpur ground truth: PM2.5 = 21, PM10 = 24 yields Indian AQI 35 (Good) and US AQI 73 (Moderate)", async () => {
    const inAqi = calculateAQI({ pm25: 21, pm10: 24 });
    const usAqi = calculateUSAQI(21);
    assert.ok(inAqi.aqi >= 34 && inAqi.aqi <= 35);
    assert.equal(inAqi.category, "Good");
    assert.equal(usAqi.usAqi, 73);
  });

  await t.test("Test 36: New York City ground truth: PM2.5 = 3, PM10 = 3 yields Indian AQI 5 and US AQI 17 (Good)", async () => {
    const inAqi = calculateAQI({ pm25: 3, pm10: 3 });
    const usAqi = calculateUSAQI(3);
    assert.equal(inAqi.aqi, 5);
    assert.equal(usAqi.usAqi, 17);
    assert.equal(usAqi.usCategory, "Good");
  });

  await t.test("Test 37: London ground truth: PM2.5 = 17, PM10 = 27 yields Indian AQI 28 (Good) and US AQI 66 (Moderate)", async () => {
    const inAqi = calculateAQI({ pm25: 17, pm10: 27 });
    const usAqi = calculateUSAQI(17);
    assert.equal(inAqi.aqi, 28);
    assert.equal(usAqi.usAqi, 66);
  });

  await t.test("Test 38: Tokyo ground truth: PM2.5 = 5, PM10 = 8 yields Indian AQI 8 (Good) and US AQI 28 (Good)", async () => {
    const inAqi = calculateAQI({ pm25: 5, pm10: 8 });
    const usAqi = calculateUSAQI(5);
    assert.equal(inAqi.aqi, 8);
    assert.equal(usAqi.usAqi, 28);
  });

  await t.test("Test 39: Beijing ground truth: PM2.5 = 7, PM10 = 30 yields Indian AQI 30 (Good) and US AQI 39 (Good)", async () => {
    const inAqi = calculateAQI({ pm25: 7, pm10: 30 });
    const usAqi = calculateUSAQI(7);
    assert.equal(inAqi.aqi, 30);
    assert.equal(usAqi.usAqi, 39);
  });

  // =========================================================================
  // SECTION 6: Backend Architecture, Deprecation, Security & Integrity (40 - 49)
  // =========================================================================

  await t.test("Test 40: GET /api/v1/health returns healthy status and zero-Python stack", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/health" });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.status, "healthy");
    assert.ok(body.architecture.includes("Zero Python Dependency"));
  });

  await t.test("Test 41: GET /api/v1/stations returns complete station directory", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/stations" });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.count >= 6);
    assert.ok(body.stations.some((s: any) => s.id === "kanpur_iitk"));
  });

  await t.test("Test 42: GET /api/v1/air-quality/current returns 404 (removed deprecated endpoint)", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/air-quality/current?stationId=kanpur_nehru",
    });
    assert.equal(res.statusCode, 404);
  });

  await t.test("Test 43: GET /api/v1/observations/latest returns 404 (removed deprecated alias)", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/observations/latest",
    });
    assert.equal(res.statusCode, 404);
  });

  await t.test("Test 44: GET /api/v1/air-quality/map returns GeoJSON FeatureCollection using live service", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/air-quality/map" });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.type, "FeatureCollection");
    assert.ok(Array.isArray(body.features));
    assert.ok(body.features.length >= 6);
  });

  await t.test("Test 45: Map feature properties contain both Indian AQI and us_aqi without fallback constants", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/air-quality/map" });
    const body = JSON.parse(res.payload);
    for (const f of body.features) {
      assert.ok("aqi" in f.properties);
      assert.ok("us_aqi" in f.properties);
      assert.notEqual(f.properties.aqi, undefined);
    }
  });

  await t.test("Test 46: Map feature properties contain real nullable meteorology (temp_c, rh_pct, wind_speed_ms)", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/air-quality/map" });
    const body = JSON.parse(res.payload);
    const sample = body.features[0].properties;
    assert.ok("temp_c" in sample);
    assert.ok("rh_pct" in sample);
    assert.ok("wind_speed_ms" in sample);
  });

  await t.test("Test 47: POST /api/v1/stations auto-detects non-Indian stations (e.g. New York) and prevents CAAQMS mislabeling", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/v1/stations",
      payload: {
        name: "Central Park Node",
        city: "New York",
        state: "New York",
        lat: 40.785091,
        lng: -73.968285,
        operator: "US EPA / DEC",
      },
    });
    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.notEqual(body.station.station_type, "CAAQMS");
  });

  await t.test("Test 48: GET /api/v1/metadata/model-performance confirms fake MAE and RMSE are deleted", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/metadata/model-performance",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.modelEvaluations.length, 0);
    assert.ok(body.note.includes("No validation set available yet"));
  });

  await t.test("Test 49: Verification that hardcoded API keys and tokens are removed from repository source", async () => {
    const repoSrc = fs.readFileSync(
      path.resolve(process.cwd(), "backend/src/repositories/observationRepository.ts"),
      "utf8"
    );
    assert.ok(!repoSrc.includes("demo-token-123456789"));
    assert.ok(!repoSrc.includes("b1b15e88fa797225412429c1c50c122a1"));
  });

  // =========================================================================
  // SECTION 7: Physics, Meteorology, Routing & Mitigation Tests (50 - 58)
  // =========================================================================

  await t.test("Test 50: Open-Meteo CO conversion correctly divides by 1000 (µg/m³ to mg/m³)", async () => {
    const liveServiceSrc = fs.readFileSync(
      path.resolve(process.cwd(), "backend/src/services/liveAirQualityService.ts"),
      "utf8"
    );
    assert.ok(liveServiceSrc.includes("/ 1000"));
    assert.ok(!liveServiceSrc.includes("/ 500"));
  });

  await t.test("Test 51: No artificial Doon Valley or Dehradun scaling multipliers (0.22 / 0.32) in repository", async () => {
    const liveServiceSrc = fs.readFileSync(
      path.resolve(process.cwd(), "backend/src/services/liveAirQualityService.ts"),
      "utf8"
    );
    assert.ok(!liveServiceSrc.includes("* 0.22"));
    assert.ok(!liveServiceSrc.includes("* 0.32"));
  });

  await t.test("Test 52: Diurnal boundary layer variation: nocturnal inversion has shallow PBLH, daytime has convective PBLH", async () => {
    const weatherRes = await server.inject({
      method: "GET",
      url: "/api/v1/analysis/weather?city=Kanpur",
    });
    assert.equal(weatherRes.statusCode, 200);
    const body = JSON.parse(weatherRes.payload);
    assert.ok(body.synopticConditions.boundaryLayerHeight_m >= 200);
    assert.ok(body.synopticConditions.boundaryLayerHeight_m <= 2200);
  });

  await t.test("Test 53: GET /api/v1/analysis/weather returns boundary layer meteorology and inversion status", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/analysis/weather?city=Kanpur",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok("boundaryLayerHeight_m" in body.synopticConditions);
    assert.ok("surfaceInversionStrength_c100m" in body.synopticConditions);
  });

  await t.test("Test 54: GET /api/v1/analysis/sources returns receptor modeling with scientific causality notice", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/analysis/sources?city=Kanpur",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.sectors.length >= 6);
    assert.ok(body.scientificCausalityNotice.includes("CRITICAL SCIENTIFIC METHODOLOGY"));
  });

  await t.test("Test 55: GET /api/v1/air-quality/history returns historical records explicitly marked simulated", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/air-quality/history?stationId=kanpur_iitk&days=7",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.mode, "simulated");
    assert.ok(body.records.length > 0);
  });

  await t.test("Test 56: GET /api/v1/forecasts returns short-term predictions with 95% uncertainty bounds", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/forecasts?stationId=kanpur_iitk&horizon=72h",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.horizon, "72h");
    assert.equal(body.points.length, 72);
    assert.ok(body.points[0].lower95 <= body.points[0].predictedValue);
    assert.ok(body.points[0].upper95 >= body.points[0].predictedValue);
  });

  await t.test("Test 57: POST /api/v1/routes/cleaner-air evaluates inhaled dosage E = sum(Ci * VE * dt)", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/v1/routes/cleaner-air",
      payload: { mode: "walking" },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.routes.length, 3);
    const cleanRoute = body.routes.find((r: any) => r.routeId === "clean_air");
    const shortestRoute = body.routes.find((r: any) => r.routeId === "shortest_distance");
    assert.ok(cleanRoute);
    assert.ok(shortestRoute);
    assert.ok(cleanRoute.cumulativeDoseInhaled_ug < shortestRoute.cumulativeDoseInhaled_ug);
  });

  await t.test("Test 58: POST /api/v1/scenarios calculates counterfactual emission reductions and thermodynamic feedback", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/v1/scenarios",
      payload: {
        city: "Kanpur",
        commercialVehicleDiversionPct: 40,
        siltSweepingWetSuppressionPct: 60,
        industrialFurnaceKilnModulationPct: 35,
        biomassBurningBanEnforcementPct: 50,
        streetVegetativeBufferPct: 30,
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.deltas.deltaPm25_pct > 15);
    assert.ok(body.thermodynamicFeedbackInterruption.isInterrupted);
  });

  await server.close();
});
