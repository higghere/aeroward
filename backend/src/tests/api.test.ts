import test from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "../server.js";

test("AeroWard Backend API & Forecasting Suite", async (t) => {
  const server = buildServer();

  await t.test("GET /api/v1/health returns healthy status and zero-Python stack", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/health",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.status, "healthy");
    assert.ok(body.architecture.includes("Zero Python Dependency"));
  });

  await t.test("GET /api/v1/stations returns monitoring stations in Kanpur and Indo-Gangetic Basin", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/stations",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.count >= 6);
    assert.ok(body.stations.some((s: any) => s.id === "kanpur_iitk"));
    assert.ok(body.stations.some((s: any) => s.id === "kanpur_nehru"));
  });

  await t.test("GET /api/v1/air-quality/current returns valid telemetry and calculated NAQI", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/air-quality/current?stationId=kanpur_nehru",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.stationId, "kanpur_nehru");
    assert.ok(body.pm25 > 0);
    assert.ok(body.aqi > 0);
    assert.ok(["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"].includes(body.category));
    assert.ok(body.meteorology.wind_speed_ms !== undefined);
  });

  await t.test("GET /api/v1/forecasts returns short-term horizon with dynamic advection", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/forecasts?stationId=kanpur_iitk&horizon=72h",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.horizon, "72h");
    assert.equal(body.points.length, 72);
    assert.ok(body.points[0].predictedValue > 0);
    assert.ok(body.points[0].lower95 <= body.points[0].predictedValue);
    assert.ok(body.points[0].upper95 >= body.points[0].predictedValue);
  });

  await t.test("GET /api/v1/forecasts/seasonal returns separate 1-7 month ensemble with honest caveats", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/forecasts/seasonal?stationId=kanpur_iitk&horizon=7m",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.horizonMonths, 7);
    assert.equal(body.forecastMonths.length, 7);
    assert.ok(body.scientificCaveat.includes("empirically validates short-term horizons"));
    assert.ok(body.forecastMonths[0].uncertaintyInterval95[1] > body.forecastMonths[0].predictedValue);
  });

  await t.test("GET /api/v1/analysis/sources returns Kanpur source apportionment with scientific disclaimer", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/v1/analysis/sources?city=Kanpur",
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.sectors.length >= 6);
    assert.ok(body.scientificCausalityNotice.includes("CRITICAL SCIENTIFIC METHODOLOGY"));
    // Winter PM2.5 mean 238 ± 96 µg/m³
    assert.ok(body.ambientPm25Mean.includes("238 ± 96"));
  });

  await t.test("POST /api/v1/routes/cleaner-air evaluates street canyon and dosage E = sum(Ci * VE * dt)", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/v1/routes/cleaner-air",
      payload: {
        mode: "walking",
      },
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.routes.length, 3);
    const cleanRoute = body.routes.find((r: any) => r.routeId === "clean_air");
    const shortestRoute = body.routes.find((r: any) => r.routeId === "shortest_distance");
    assert.ok(cleanRoute);
    assert.ok(shortestRoute);
    assert.ok(cleanRoute.cumulativeDoseInhaled_ug < shortestRoute.cumulativeDoseInhaled_ug);
    assert.ok(cleanRoute.doseReductionPctVsShortest > 15);
  });

  await t.test("POST /api/v1/scenarios simulates counterfactual intervention and feedback loop disruption", async () => {
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
    assert.ok(body.deltas.pblhRecovery_m > 0);
    assert.ok(body.thermodynamicFeedbackInterruption.isInterrupted);
  });

  await server.close();
  process.exit(0);
});
