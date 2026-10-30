"use client";

import { 
  Info, 
  Database, 
  Cpu, 
  Server, 
  ShieldCheck, 
  Radio, 
  Layers, 
  ExternalLink,
  Code2,
  CheckCircle2
} from "lucide-react";
import { DATA_SOURCES_REGISTRY } from "@/backend/src/repositories/dataStore";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Architecture &amp; Data Provenance
          </span>
          <span className="rounded bg-surface-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted border border-border">
            Full-Stack Node.js Engine
          </span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
          System Overview &amp; Data Governance
        </h1>
        <p className="mt-2 max-w-3xl text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
          AeroWard is an end-to-end predictive air quality intelligence and proactive intervention platform designed to bridge the gap between spaceborne Earth observation, ground-level monitoring stations, and municipal decision-making.
        </p>
      </div>

      {/* System Technical Architecture Grid (Section 15 Requirement) */}
      <div className="mt-8 rounded-sm border border-border bg-surface-elevated p-6 shadow-elevation">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
          <Cpu className="h-5 w-5 text-data-weather" />
          <h2 className="font-display text-xl font-bold text-text-primary">
            Engineering Architecture: Zero-Python Node.js Stack
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 font-mono text-xs">
          {/* Layer 1: Frontend Client */}
          <div className="rounded-sm border border-border-subtle bg-surface p-4 space-y-2.5">
            <div className="flex items-center justify-between text-accent font-bold">
              <span>FRONTEND APPLICATION</span>
              <span className="text-[10px] text-text-muted">CLIENT TIER</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              Next.js 14 (App Router) &bull; React &bull; TypeScript &bull; Tailwind CSS v3 with centralized CSS variables &bull; Framer Motion &bull; GSAP for cinematic atmospheric physics canvas &bull; MapLibre GL JS &bull; Recharts &bull; Lucide Icons.
            </p>
          </div>

          {/* Layer 2: Fastify REST Backend */}
          <div className="rounded-sm border border-border-subtle bg-surface p-4 space-y-2.5">
            <div className="flex items-center justify-between text-data-weather font-bold">
              <span>REST BACKEND SERVER</span>
              <span className="text-[10px] text-text-muted">API TIER</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              Node.js v24 &bull; Fastify &bull; TypeScript &bull; Zod request/response validation &bull; Pino structured logging &bull; Ingestion scheduler &bull; Spatiotemporal graph neural network emulator &bull; Zero Python microservice dependency.
            </p>
          </div>

          {/* Layer 3: Spatial Database & Caching */}
          <div className="rounded-sm border border-border-subtle bg-surface p-4 space-y-2.5">
            <div className="flex items-center justify-between text-data-improvement font-bold">
              <span>SPATIAL DATABASE</span>
              <span className="text-[10px] text-text-muted">DATA TIER</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              PostgreSQL with PostGIS extension for monitoring station spatial indexing and street network geometries &bull; In-memory research repository fallback &bull; Deterministic synthetic calibration for resilient development.
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources Registry & Provenance (Section 14 Requirement) */}
      <div className="mt-8 rounded-sm border border-border bg-surface-elevated p-6 shadow-elevation">
        <div className="border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-text-primary">
              Data Sources &amp; Provenance Registry
            </h2>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            Transparency on data providers, measurement instrumentation, and operational status.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {DATA_SOURCES_REGISTRY.map((src) => (
            <div key={src.id} className="rounded-sm border border-border-subtle bg-surface p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary">{src.dataset}</h3>
                  <div className="font-mono text-xs text-text-muted mt-0.5">Provider: {src.provider}</div>
                </div>
                <span className="rounded bg-data-improvement/20 px-2 py-0.5 font-mono text-[10px] text-data-improvement uppercase">
                  {src.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono text-xs">
                <div>
                  <span className="text-text-muted text-[10px] uppercase">Measurement Type:</span>
                  <div className="text-text-primary mt-0.5 font-sans">{src.measurementType}</div>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase">Temporal Resolution:</span>
                  <div className="text-text-primary mt-0.5">{src.temporalResolution}</div>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase">Spatial Footprint:</span>
                  <div className="text-text-primary mt-0.5">{src.spatialScope}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-text-secondary">
                <strong className="text-text-primary">Provenance Note:</strong> {src.provenanceNote}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REST API Endpoints Specification (Section 15 Requirement) */}
      <div className="mt-8 rounded-sm border border-border bg-surface-elevated p-6 shadow-elevation">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
          <Code2 className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-text-primary">
            AeroWard REST API Endpoints (Fastify /api/v1)
          </h2>
        </div>

        <div className="mt-4 space-y-2 font-mono text-xs">
          {[
            { method: "GET", path: "/api/v1/health", desc: "System health check, uptime, and architecture verification." },
            { method: "GET", path: "/api/v1/stations", desc: "List all CAAQMS stations in Kanpur and Indo-Gangetic Basin." },
            { method: "GET", path: "/api/v1/air-quality/current", desc: "Real-time pollutant telemetry, NAQI, and boundary layer meteorology." },
            { method: "GET", path: "/api/v1/air-quality/history", desc: "Historical time-series with documented episodic stagnation events." },
            { method: "GET", path: "/api/v1/air-quality/map", desc: "GeoJSON FeatureCollection formatted for MapLibre GL JS spatial rendering." },
            { method: "GET", path: "/api/v1/forecasts", desc: "Short-term 12h–72h multi-step forecast with 95% uncertainty bounds." },
            { method: "GET", path: "/api/v1/forecasts/seasonal", desc: "Long-range 1–7-month seasonal statistical climatological ensemble." },
            { method: "GET", path: "/api/v1/analysis/sources", desc: "Source apportionment receptor mass balance (Summer vs Winter regimes)." },
            { method: "GET", path: "/api/v1/analysis/weather", desc: "Aerosol-radiation feedback loop status and AOT40 wheat yield loss index." },
            { method: "GET", path: "/api/v1/recommendations", desc: "Predictive GRAP municipal directives and BMS automated HVAC commands." },
            { method: "POST", path: "/api/v1/routes/cleaner-air", desc: "Exposure-aware routing minimizing cumulative dosage E = sum(Ci * VE * dt)." },
            { method: "POST", path: "/api/v1/scenarios", desc: "Counterfactual scenario laboratory evaluating intervention efficacy." },
            { method: "GET", path: "/api/v1/metadata/data-sources", desc: "Full data provenance and instrumentation registry." },
            { method: "GET", path: "/api/v1/metadata/model-performance", desc: "Chronological out-of-sample validation metrics (MAE, RMSE, Skill)." },
          ].map((ep, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded border border-border-subtle bg-surface p-2.5">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 font-bold text-[10px] ${ep.method === "POST" ? "bg-accent/20 text-accent" : "bg-data-weather/20 text-data-weather"}`}>
                  {ep.method}
                </span>
                <span className="text-text-primary font-bold">{ep.path}</span>
              </div>
              <span className="text-text-muted text-[11px] font-sans">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
