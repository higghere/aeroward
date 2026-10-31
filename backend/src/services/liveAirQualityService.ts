import { FastifyRequest, FastifyReply } from "fastify";
import { config } from "../config/index.js";
import { stationRepository } from "../repositories/stationRepository.js";
import { observationRepository } from "../repositories/observationRepository.js";
import { generateShortTermForecast } from "../forecasting/shortTermModel.js";
import { generateLongRangeForecast } from "../forecasting/longRangeModel.js";
import { sourceApportionmentService } from "../analysis/sourceApportionmentService.js";
import { meteorologyService } from "../analysis/meteorologyService.js";
import { mitigationService } from "../recommendations/mitigationService.js";
import { routingEngine } from "../geospatial/routingEngine.js";
import { scenarioEngine } from "../scenarios/scenarioEngine.js";
import { DATA_SOURCES_REGISTRY, Observation } from "../repositories/dataStore.js";
import { liveAirQualityService } from "../services/liveAirQualityService.js";
import { geocodingService, CITY_GEO_INDEX } from "../services/geocodingService.js";
import {
  LocationQuerySchema,
  HistoryQuerySchema,
  ForecastQuerySchema,
  RouteComparisonSchema,
  ScenarioSimulationSchema,
} from "../schemas/index.js";

export class AirQualityController {
  async getHealth(req: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      status: "healthy",
      service: "AeroWard Environmental Intelligence Engine",
      version: "1.0.0",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      architecture: "Node.js + Fastify + TypeScript (Zero Python Dependency)",
    });
  }

  async getStations(req: FastifyRequest, reply: FastifyReply) {
    const stations = await stationRepository.getAll();
    return reply.send({ count: stations.length, stations });
  }

  async postStation(req: FastifyRequest, reply: FastifyReply) {
    const body = req.body as any;
    if (!body || !body.name || body.lat === undefined || body.lng === undefined) {
      return reply.status(400).send({ error: "Missing required station fields: name, lat, lng" });
    }

    let resolvedLat = Number(body.lat);
    let resolvedLng = Number(body.lng);
    let resolvedCity = body.city ?? "Custom Location";
    let resolvedState = body.state ?? "Uttar Pradesh";

    const isKanpurDefaultCoords = Math.abs(resolvedLat - 26.475) < 0.05 && Math.abs(resolvedLng - 80.32) < 0.05;
    const isNamedNonKanpur = !body.name.toLowerCase().includes("kanpur") && !resolvedCity.toLowerCase().includes("kanpur");

    if (isKanpurDefaultCoords && isNamedNonKanpur) {
      const geo = await geocodingService.resolveLocation(body.name || resolvedCity);
      if (geo && (Math.abs(geo.lat - 26.475) > 0.1 || Math.abs(geo.lng - 80.32) > 0.1)) {
        resolvedLat = geo.lat;
        resolvedLng = geo.lng;
        resolvedCity = geo.city || resolvedCity;
        resolvedState = geo.state || resolvedState;
      }
    }

    const newStation = {
      id: body.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: body.name,
      city: resolvedCity,
      state: resolvedState,
      lat: resolvedLat,
      lng: resolvedLng,
      elevation_m: Number(body.elevation_m) || 125,
      station_type: (body.station_type || "Micro_Sensor") as any,
      operator: body.operator || "Citizen Science / Custom Station",
      status: "active" as const,
      silt_loading_gm2: Number(body.silt_loading_gm2) || 4.2,
      canyon_hw_ratio: Number(body.canyon_hw_ratio) || 1.1,
      canyon_btr: Number(body.canyon_btr) || 0.7,
    };
    await stationRepository.addStation(newStation);
    const observation = await liveAirQualityService.getLiveObservation(newStation);
    return reply.status(201).send({
      message: "Station added successfully",
      station: newStation,
      observation,
    });
  }

  async searchPlaces(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const input = (query.input || "").trim();
    if (!input || input.length < 2) {
      return reply.send({ suggestions: [] });
    }

    const apiKey = config.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const googleRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: ["in"],
          }),
        });

        if (googleRes.ok) {
          const data = (await googleRes.json()) as any;
          const rawSuggestions = data.suggestions || [];
          if (rawSuggestions.length > 0) {
            const suggestions = rawSuggestions.map((s: any) => ({
              placeId: s.placePrediction?.placeId,
              name: s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text,
              formattedAddress: s.placePrediction?.text?.text,
            }));
            return reply.send({ suggestions });
          }
        }
      } catch (err) {
        // Fallback to local index
      }
    }

    const queryLower = input.toLowerCase();
    const suggestions: any[] = [];

    for (const [key, val] of Object.entries(CITY_GEO_INDEX)) {
      if (key.includes(queryLower) || val.city.toLowerCase().includes(queryLower) || val.state.toLowerCase().includes(queryLower)) {
        suggestions.push({
          placeId: `geo_${key}`,
          name: val.city,
          formattedAddress: `${val.city}, ${val.state}, ${val.country}`,
        });
        if (suggestions.length >= 5) break;
      }
    }

    if (suggestions.length > 0) {
      return reply.send({ suggestions });
    }

    try {
      const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=5`);
      if (photonRes.ok) {
        const pData = (await photonRes.json()) as any;
        const features = pData.features || [];
        const pMatches = features.map((f: any, idx: number) => {
          const p = f.properties || {};
          const label = [p.name, p.city, p.state, p.country].filter(Boolean).join(", ");
          return {
            placeId: `geo_${p.city?.toLowerCase() || p.name?.toLowerCase() || idx}`,
            name: p.name || p.city || input,
            formattedAddress: label || `${input}, India`,
          };
        });
        if (pMatches.length > 0) {
          return reply.send({ suggestions: pMatches });
        }
      }
    } catch {}

    return reply.send({
      suggestions: [
        {
          placeId: `geo_${encodeURIComponent(input.toLowerCase())}`,
          name: input,
          formattedAddress: `${input}, India`,
        },
      ],
    });
  }

  async getPlaceDetails(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const placeId = query.placeId;
    const fallbackQuery = query.name || query.query || "";
    if (!placeId && !fallbackQuery) {
      return reply.status(400).send({ error: "placeId or query is required" });
    }

    const apiKey = config.GOOGLE_MAPS_API_KEY;

    try {
      if (placeId && !placeId.startsWith("custom_") && !placeId.startsWith("geo_")) {
        const googleRes = await fetch(
          `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName,formattedAddress,location,addressComponents`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
            },
          }
        );

        if (googleRes.ok) {
          const data = (await googleRes.json()) as any;
          const cityComp = data.addressComponents?.find((c: any) => c.types?.includes("locality") || c.types?.includes("administrative_area_level_2"));
          const stateComp = data.addressComponents?.find((c: any) => c.types?.includes("administrative_area_level_1"));

          if (data.location?.latitude && data.location?.longitude) {
            return reply.send({
              placeId: data.id,
              name: data.displayName?.text || data.formattedAddress?.split(",")[0],
              formattedAddress: data.formattedAddress,
              lat: data.location.latitude,
              lng: data.location.longitude,
              city: cityComp ? cityComp.longText : data.displayName?.text || "Regional Node",
              state: stateComp ? stateComp.longText : "India",
            });
          }
        }
      }
    } catch (err) {
      // Continue to geocodingService
    }

    const targetString = fallbackQuery || (placeId ? placeId.replace(/^geo_/i, "").replace(/[_-]/g, " ").trim() : "India");
    const geo = await geocodingService.resolveLocation(targetString);

    return reply.send({
      placeId: placeId || `geo_${Date.now()}`,
      name: geo.city || geo.name,
      formattedAddress: geo.formattedAddress,
      lat: geo.lat,
      lng: geo.lng,
      city: geo.city,
      state: geo.state,
    });
  }

  private liveCache: { timestamp: number; data: Observation[] } | null = null;

  async getCurrent(req: FastifyRequest, reply: FastifyReply) {
    const query = LocationQuerySchema.safeParse(req.query);
    const stationId = query.success ? query.data.stationId : (req.query as any)?.stationId;

    if (stationId) {
      const station = await stationRepository.getById(stationId);
      if (station) {
        const obs = await liveAirQualityService.getLiveObservation(station);
        return reply.send(obs);
      }
      const obs = observationRepository.getCurrentByStation(stationId);
      return reply.send(obs);
    }

    const now = Date.now();
    if (this.liveCache && now - this.liveCache.timestamp < 30000) {
      return reply.send({ count: this.liveCache.data.length, observations: this.liveCache.data });
    }

    try {
      const stations = await stationRepository.getAll();
      const liveObs = await Promise.all(
        stations.map((s) => liveAirQualityService.getLiveObservation(s))
      );
      this.liveCache = { timestamp: now, data: liveObs };
      return reply.send({ count: liveObs.length, observations: liveObs });
    } catch {
      const all = observationRepository.getAllCurrent();
      return reply.send({ count: all.length, observations: all });
    }
  }

  async getMapData(req: FastifyRequest, reply: FastifyReply) {
    const geojson = observationRepository.getGeoJSON();
    return reply.send(geojson);
  }

  async getHistory(req: FastifyRequest, reply: FastifyReply) {
    const query = HistoryQuerySchema.safeParse(req.query);
    const stationId = query.success && query.data.stationId ? query.data.stationId : "kanpur_iitk";
    const days = query.success && query.data.days ? query.data.days : 30;

    const history = observationRepository.getHistorical(stationId, days);
    return reply.send({
      stationId,
      daysRequested: days,
      count: history.length,
      records: history,
    });
  }

  async getForecasts(req: FastifyRequest, reply: FastifyReply) {
    const query = ForecastQuerySchema.safeParse(req.query);
    const stationId = query.success && query.data.stationId ? query.data.stationId : "kanpur_iitk";
    const pollutant = query.success && query.data.pollutant ? query.data.pollutant : "PM2.5";
    const horizon = (query.success && ["12h", "24h", "48h", "72h"].includes(query.data.horizon)) ? (query.data.horizon as "12h" | "24h" | "48h" | "72h") : "72h";

    const forecast = generateShortTermForecast(stationId, pollutant, horizon);
    return reply.send(forecast);
  }

  async getForecastByLocation(req: FastifyRequest<{ Params: { locationId: string } }>, reply: FastifyReply) {
    const { locationId } = req.params;
    const query = ForecastQuerySchema.safeParse(req.query);
    const pollutant = query.success && query.data.pollutant ? query.data.pollutant : "PM2.5";
    const horizon = (query.success && ["12h", "24h", "48h", "72h"].includes(query.data.horizon)) ? (query.data.horizon as "12h" | "24h" | "48h" | "72h") : "72h";

    const forecast = generateShortTermForecast(locationId, pollutant, horizon);
    return reply.send(forecast);
  }

  async getSeasonalForecast(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const stationId = query.stationId || "kanpur_iitk";
    const pollutant = query.pollutant || "PM2.5";
    const horizonMonths = query.horizon ? parseInt(query.horizon.replace("m", ""), 10) || 7 : 7;

    const seasonal = generateLongRangeForecast(stationId, pollutant, horizonMonths);
    return reply.send(seasonal);
  }

  async getSources(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const city = query.city || "Kanpur";
    const analysis = sourceApportionmentService.getSourceAnalysis(city);
    return reply.send(analysis);
  }

  async getWeather(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const city = query.city || "Kanpur";
    const weather = meteorologyService.getAtmosphericAnalysis(city);
    return reply.send(weather);
  }

  async getRecommendations(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const city = query.city || "Kanpur";
    const plan = mitigationService.getPredictiveGrapPlan(city);
    return reply.send(plan);
  }

  async postCleanerAirRoute(req: FastifyRequest, reply: FastifyReply) {
    const body = RouteComparisonSchema.safeParse(req.body);
    const origin = body.success ? body.data.origin : undefined;
    const destination = body.success ? body.data.destination : undefined;
    const mode = body.success ? body.data.mode : "walking";

    const result = routingEngine.compareRoutes(
      origin ? { lat: origin.lat, lng: origin.lng, name: origin.name || "Origin" } : undefined,
      destination ? { lat: destination.lat, lng: destination.lng, name: destination.name || "Destination" } : undefined,
      mode
    );
    return reply.send(result);
  }

  async getCleanerAirRoute(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const mode = query.mode === "cycling" ? "cycling" : query.mode === "driving" ? "driving" : "walking";
    const result = routingEngine.compareRoutes(undefined, undefined, mode);
    return reply.send(result);
  }

  async postScenario(req: FastifyRequest, reply: FastifyReply) {
    const body = ScenarioSimulationSchema.safeParse(req.body);
    const params = body.success ? body.data : {
      city: "Kanpur",
      commercialVehicleDiversionPct: 35,
      siltSweepingWetSuppressionPct: 50,
      industrialFurnaceKilnModulationPct: 30,
      biomassBurningBanEnforcementPct: 40,
      streetVegetativeBufferPct: 25,
    };

    const result = scenarioEngine.simulate(params);
    return reply.send(result);
  }

  async getScenario(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const params = {
      city: query.city || "Kanpur",
      commercialVehicleDiversionPct: query.commercialVehicleDiversionPct ? parseFloat(query.commercialVehicleDiversionPct) : 35,
      siltSweepingWetSuppressionPct: query.siltSweepingWetSuppressionPct ? parseFloat(query.siltSweepingWetSuppressionPct) : 50,
      industrialFurnaceKilnModulationPct: query.industrialFurnaceKilnModulationPct ? parseFloat(query.industrialFurnaceKilnModulationPct) : 30,
      biomassBurningBanEnforcementPct: query.biomassBurningBanEnforcementPct ? parseFloat(query.biomassBurningBanEnforcementPct) : 40,
      streetVegetativeBufferPct: query.streetVegetativeBufferPct ? parseFloat(query.streetVegetativeBufferPct) : 25,
    };
    const result = scenarioEngine.simulate(params);
    return reply.send(result);
  }

  async getDataSources(req: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      count: DATA_SOURCES_REGISTRY.length,
      dataSources: DATA_SOURCES_REGISTRY,
    });
  }

  async getModelPerformance(req: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      note: "No validation set available yet. Metrics intentionally omitted until a real benchmark is published.",
      modelEvaluations: [],
    });
  }
}

export const airQualityController = new AirQualityController();
