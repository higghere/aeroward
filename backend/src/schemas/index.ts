import { z } from "zod";

export const PollutantEnum = z.enum(["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "AQI"]);
export type Pollutant = z.infer<typeof PollutantEnum>;

export const ForecastHorizonEnum = z.enum([
  "12h", "24h", "48h", "72h",
  "1m", "2m", "3m", "4m", "5m", "6m", "7m"
]);
export type ForecastHorizon = z.infer<typeof ForecastHorizonEnum>;

export const LocationQuerySchema = z.object({
  stationId: z.string().optional(),
  city: z.string().optional().default("Kanpur"),
  pollutant: PollutantEnum.optional().default("PM2.5"),
});

export const HistoryQuerySchema = z.object({
  stationId: z.string().optional(),
  city: z.string().optional().default("Kanpur"),
  pollutant: PollutantEnum.optional().default("PM2.5"),
  days: z.coerce.number().min(1).max(365).optional().default(30),
});

export const ForecastQuerySchema = z.object({
  stationId: z.string().optional(),
  city: z.string().optional().default("Kanpur"),
  pollutant: PollutantEnum.optional().default("PM2.5"),
  horizon: ForecastHorizonEnum.optional().default("72h"),
});

export const RouteComparisonSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    name: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    name: z.string().optional(),
  }),
  mode: z.enum(["walking", "cycling", "driving"]).default("walking"),
  timeOfDay: z.string().optional(),
});

export const ScenarioSimulationSchema = z.object({
  city: z.string().default("Kanpur"),
  commercialVehicleDiversionPct: z.number().min(0).max(100).default(0),
  siltSweepingWetSuppressionPct: z.number().min(0).max(100).default(0),
  industrialFurnaceKilnModulationPct: z.number().min(0).max(100).default(0),
  biomassBurningBanEnforcementPct: z.number().min(0).max(100).default(0),
  streetVegetativeBufferPct: z.number().min(0).max(100).default(0),
});
