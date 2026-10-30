import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional().default("postgresql://aeroward_user:password@localhost:5432/aeroward_db"),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  DEMO_MODE: z.coerce.boolean().default(true),
  ENABLE_SCHEDULED_INGESTION: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  CPCB_API_KEY: z.string().optional().default(""),
  SENTINEL_API_KEY: z.string().optional().default(""),
  ECMWF_API_KEY: z.string().optional().default(""),
  GOOGLE_MAPS_API_KEY: z.string().optional().default(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBO9KDwxmwwvtYTFkbswzQEi57uA-bZ69I"),
});

export const config = envSchema.parse(process.env);
