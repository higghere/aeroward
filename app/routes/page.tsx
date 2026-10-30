"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Footprints, 
  Bike, 
  Car, 
  Layers, 
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity
} from "lucide-react";
import { 
  routingEngine, 
  PRESET_OD_PAIRS, 
  RouteSegment, 
  RouteOption 
} from "@/backend/src/geospatial/routingEngine";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[460px] w-full items-center justify-center rounded-sm border border-border bg-surface font-mono text-xs text-text-muted">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 animate-spin text-accent" />
        <span>Synthesizing Micro-Exposure Street Canyon Network...</span>
      </div>
    </div>
  ),
});

export default function RoutesPage() {
  const [selectedOdId, setSelectedOdId] = useState<string>(PRESET_OD_PAIRS[0].id);
  const [mode, setMode] = useState<"walking" | "cycling" | "driving">("walking");
  const [activeRouteId, setActiveRouteId] = useState<"clean_air" | "balanced" | "shortest_distance">("clean_air");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const selectedOd = PRESET_OD_PAIRS.find((od) => od.id === selectedOdId) || PRESET_OD_PAIRS[0];

  const comparison = useMemo(() => {
    return routingEngine.compareRoutes(selectedOd.origin, selectedOd.destination, mode);
  }, [selectedOd, mode]);

  const activeRoute = comparison.routes.find((r) => r.routeId === activeRouteId) || comparison.routes[0];

  const activeSegment = useMemo(() => {
    if (!selectedSegmentId) return activeRoute.segments[0] || null;
    return activeRoute.segments.find((s) => s.segmentId === selectedSegmentId) || activeRoute.segments[0] || null;
  }, [activeRoute, selectedSegmentId]);

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">
              Microscale Geospatial Exposure
            </span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">
              Street Canyon Aerodynamics
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Exposure-Aware Cleaner-Air Navigation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Minimizes personal particulate and nitrogen dioxide inhalation dosage by navigating windward sidewalks and greenway buffers.
          </p>
        </div>

        {/* Origin-Destination Corridor Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent shrink-0" />
          <select
            value={selectedOdId}
            onChange={(e) => {
              setSelectedOdId(e.target.value);
              setSelectedSegmentId(null);
            }}
            className="rounded-sm border border-border bg-surface-elevated px-3 py-2 font-sans text-xs text-text-primary focus:border-accent focus:outline-none"
          >
            {PRESET_OD_PAIRS.map((od) => (
              <option key={od.id} value={od.id}>
                {od.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transit Mode & Inhalation Ventilation Rate Bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-4">
        {/* Mode Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-text-muted font-sans tracking-wider">Mode:</span>
          <div className="inline-flex rounded-sm border border-border bg-surface-elevated p-1">
            <button
              onClick={() => setMode("walking")}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                mode === "walking"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Footprints className="h-3.5 w-3.5" /> Walking (15 L/min)
            </button>
            <button
              onClick={() => setMode("cycling")}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                mode === "cycling"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Bike className="h-3.5 w-3.5" /> Cycling (45 L/min)
            </button>
            <button
              onClick={() => setMode("driving")}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                mode === "driving"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Car className="h-3.5 w-3.5" /> In-Transit / Cabin (10 L/min)
            </button>
          </div>
        </div>

        {/* Ventilation Volume Readout */}
        <div className="flex items-center gap-4 text-xs font-sans text-text-secondary">
          <div>
            <span className="text-text-muted">Minute Inhalation Volume V_E(m):</span>{" "}
            <span className="font-mono font-bold text-text-primary">
              {comparison.minuteVentilationVolume_m3_min} m³/min
            </span>
          </div>
          <div>
            <span className="text-text-muted">Hourly Ventilation:</span>{" "}
            <span className="font-mono font-bold text-accent">
              {comparison.hourlyVentilationVolume_m3_hr} m³/hr
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Route Map & Telemetry Dashboard */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Column */}
        <div className="lg:col-span-7">
          <div className="h-[520px] w-full">
            <RouteMap
              routes={comparison.routes}
              activeRouteId={activeRouteId}
              onSelectRoute={(id) => {
                setActiveRouteId(id);
                setSelectedSegmentId(null);
              }}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={(seg) => setSelectedSegmentId(seg ? seg.segmentId : null)}
            />
          </div>

          {/* Route Option Switcher Below Map */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {comparison.routes.map((rt) => {
              const isActive = rt.routeId === activeRouteId;
              const isClean = rt.routeId === "clean_air";
              const isShortest = rt.routeId === "shortest_distance";

              return (
                <button
                  key={rt.routeId}
                  onClick={() => {
                    setActiveRouteId(rt.routeId);
                    setSelectedSegmentId(null);
                  }}
                  className={`text-left p-3.5 rounded-sm border transition-all ${
                    isActive
                      ? "border-accent bg-surface-elevated shadow-sm"
                      : "border-border-subtle bg-surface hover:bg-surface-elevated/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-sans ${
                        isClean ? "text-data-improvement" : isShortest ? "text-danger" : "text-warning"
                      }`}
                    >
                      {rt.title.split(" ")[0]} Route
                    </span>
                    {isClean && (
                      <span className="rounded bg-data-improvement/20 px-1.5 py-0.5 text-[10px] font-mono text-data-improvement font-bold">
                        -{rt.doseReductionPctVsShortest}% DOSE
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs font-sans">
                    <span className="text-text-muted">{rt.totalDistanceKm} km &bull; {rt.totalDurationMinutes} min</span>
                    <span className="font-mono text-sm font-bold text-text-primary">
                      {rt.cumulativeDoseInhaled_ug} <span className="text-[10px] text-text-muted">µg</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry & Segment Inspection Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Route Overview */}
          <div className="border-t border-border-strong pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-accent font-semibold font-sans">
                Active Trajectory
              </span>
              <span className="font-mono text-xs font-bold text-text-primary">
                {activeRoute.totalDistanceKm} km &bull; {activeRoute.totalDurationMinutes} mins
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-text-primary">
              {activeRoute.title}
            </h2>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              {activeRoute.summary}
            </p>

            {/* Aerodynamic Canyon Explanation */}
            <div className="mt-3 text-xs text-text-muted leading-relaxed font-sans border-l-2 border-border-strong pl-3">
              {activeRoute.canyonAerodynamicExplanation}
            </div>
          </div>

          {/* Dosage Integration Metrics */}
          <div className="border-t border-b border-border-subtle py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted font-sans">Total Inhaled Dose (E):</span>
                <div className="mt-1 font-mono text-2xl font-bold text-accent">
                  {activeRoute.cumulativeDoseInhaled_ug}{" "}
                  <span className="text-xs font-normal text-text-muted">µg particulate</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-text-muted font-sans">Corridor Mean PM2.5:</span>
                <div className="mt-1 font-mono text-2xl font-bold text-text-primary">
                  {activeRoute.averagePm25_ugm3}{" "}
                  <span className="text-xs font-normal text-text-muted">µg/m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Segmented Micro-Environment Telemetry Inspector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-text-primary">
                Segmented Canyon Micro-Telemetry
              </h3>
              <span className="text-[11px] font-sans text-text-muted">
                Click segment to inspect
              </span>
            </div>

            {/* Segments List */}
            <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
              {activeRoute.segments.map((seg) => {
                const isSelected = activeSegment?.segmentId === seg.segmentId;
                return (
                  <div
                    key={seg.segmentId}
                    onClick={() => setSelectedSegmentId(seg.segmentId)}
                    className={`py-3 px-2 cursor-pointer transition-colors ${
                      isSelected ? "bg-surface-elevated" : "hover:bg-surface-elevated/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium font-sans text-text-primary">
                        {seg.name}
                      </span>
                      <span className="font-mono font-bold text-accent">
                        {seg.inhalationDoseSegment_ug} µg
                      </span>
                    </div>

                    <div className="mt-1.5 grid grid-cols-3 gap-2 text-[11px] font-sans text-text-muted">
                      <div>
                        <span>Canyon H/W:</span>{" "}
                        <span className="font-mono text-text-primary font-medium">{seg.canyonHwRatio}</span>
                      </div>
                      <div>
                        <span>Local PM2.5:</span>{" "}
                        <span className="font-mono text-text-primary font-medium">{seg.microscalePm25} µg/m³</span>
                      </div>
                      <div>
                        <span>Vortex Flow:</span>{" "}
                        <span className="font-sans text-data-weather capitalize">{seg.sidewalkSide}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Segment Detail Card */}
          {activeSegment && (
            <div className="border-l-2 border-accent bg-surface-elevated/80 p-4 text-xs font-sans">
              <div className="font-semibold text-text-primary">
                Aerodynamic Vortex Diagnostics: {activeSegment.name}
              </div>
              <div className="mt-2 space-y-1 text-text-secondary text-[11px]">
                <div>
                  &bull; <strong>Aspect Ratio (H/W = {activeSegment.canyonHwRatio}):</strong>{" "}
                  {activeSegment.canyonHwRatio >= 1.0
                    ? "Deep canyon with perpendicular crosswind recirculation; vehicle emissions linger 18% longer."
                    : "Wide open or greenway corridor; unimpeded atmospheric flushing and minimal leeward vortex trapping."}
                </div>
                <div>
                  &bull; <strong>Build-to-Line Ratio (BTR = {activeSegment.buildToLineRatio}):</strong>{" "}
                  Continuous street facades retain roadside exhaust plume on pedestrian walkways.
                </div>
                <div>
                  &bull; <strong>Inhalation Dosage Contribution:</strong>{" "}
                  {activeSegment.inhalationDoseSegment_ug} µg over {activeSegment.durationMinutes} minutes traversal.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
