import { FastifyInstance } from "fastify";
import { airQualityController } from "../controllers/airQualityController.js";

export async function apiRoutes(server: FastifyInstance) {
  // System Health
  server.get("/health", airQualityController.getHealth.bind(airQualityController));

  // Monitoring Stations
  server.get("/stations", airQualityController.getStations.bind(airQualityController));
  server.post("/stations", airQualityController.postStation.bind(airQualityController));

  // Google Maps Places Autocomplete & Details API
  server.get("/places/autocomplete", airQualityController.searchPlaces.bind(airQualityController));
  server.get("/places/details", airQualityController.getPlaceDetails.bind(airQualityController));

  // Air Quality Observations
  server.get("/air-quality/current", airQualityController.getCurrent.bind(airQualityController));
  server.get("/air-quality/history", airQualityController.getHistory.bind(airQualityController));
  server.get("/air-quality/map", airQualityController.getMapData.bind(airQualityController));
  // Aliases for observations
  server.get("/observations/latest", airQualityController.getCurrent.bind(airQualityController));
  server.get("/observations/history", airQualityController.getHistory.bind(airQualityController));
  server.get("/observations/map", airQualityController.getMapData.bind(airQualityController));

  // Forecasting (Short-term 12-72h & Long-range 1-7 months)
  server.get("/forecasts", airQualityController.getForecasts.bind(airQualityController));
  server.get("/forecasts/seasonal", airQualityController.getSeasonalForecast.bind(airQualityController));
  server.get("/forecasts/:locationId", airQualityController.getForecastByLocation.bind(airQualityController));
  // Aliases for forecasting
  server.get("/forecast/short-term", airQualityController.getForecasts.bind(airQualityController));
  server.get("/forecast/long-range", airQualityController.getSeasonalForecast.bind(airQualityController));

  // Source & Meteorology Analysis
  server.get("/analysis/sources", airQualityController.getSources.bind(airQualityController));
  server.get("/analysis/source-apportionment", airQualityController.getSources.bind(airQualityController));
  server.get("/analysis/weather", airQualityController.getWeather.bind(airQualityController));
  server.get("/analysis/meteorology", airQualityController.getWeather.bind(airQualityController));

  // Recommendations & Predictive GRAP
  server.get("/recommendations", airQualityController.getRecommendations.bind(airQualityController));

  // Exposure-Aware Cleaner-Air Routing
  server.get("/routes/cleaner-air", airQualityController.getCleanerAirRoute.bind(airQualityController));
  server.post("/routes/cleaner-air", airQualityController.postCleanerAirRoute.bind(airQualityController));
  server.get("/routes/compare", airQualityController.getCleanerAirRoute.bind(airQualityController));
  server.post("/routes/compare", airQualityController.postCleanerAirRoute.bind(airQualityController));

  // Environmental Scenario Laboratory
  server.get("/scenarios", airQualityController.getScenario.bind(airQualityController));
  server.post("/scenarios", airQualityController.postScenario.bind(airQualityController));
  server.get("/scenarios/simulate", airQualityController.getScenario.bind(airQualityController));
  server.post("/scenarios/simulate", airQualityController.postScenario.bind(airQualityController));

  // Metadata & Provenance
  server.get("/metadata/data-sources", airQualityController.getDataSources.bind(airQualityController));
  server.get("/metadata/model-performance", airQualityController.getModelPerformance.bind(airQualityController));
}
