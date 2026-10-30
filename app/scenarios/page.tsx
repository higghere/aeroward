"use client";

import { useState, useMemo } from "react";
import { 
  Sliders, 
  RotateCcw, 
  ShieldAlert, 
  TrendingDown, 
  Sparkles, 
  Wind, 
  Flame, 
  Truck, 
  Factory, 
  TreePine,
  Wheat,
  Activity,
  Layers,
  MapPin
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from "recharts";
import { scenarioEngine, ScenarioSimulationResult } from "@/backend/src/scenarios/scenarioEngine";

export default function ScenariosPage() {
  const [params, setParams] = useState({
    city: "Kanpur",
    commercialVehicleDiversionPct: 40,
    siltSweepingWetSuppressionPct: 60,
    industrialFurnaceKilnModulationPct: 35,
    biomassBurningBanEnforcementPct: 50,
    streetVegetativeBufferPct: 30,
  });

  const result: ScenarioSimulationResult = useMemo(() => {
    return scenarioEngine.simulate(params);
  }, [params]);

  const handleReset = () => {
    setParams({
      city: "Kanpur",
      commercialVehicleDiversionPct: 0,
      siltSweepingWetSuppressionPct: 0,
      industrialFurnaceKilnModulationPct: 0,
      biomassBurningBanEnforcementPct: 0,
      streetVegetativeBufferPct: 0,
    });
  };

  const handlePresetAggressive = () => {
    setParams({
      city: "Kanpur",
      commercialVehicleDiversionPct: 75,
      siltSweepingWetSuppressionPct: 85,
      industrialFurnaceKilnModulationPct: 60,
      biomassBurningBanEnforcementPct: 80,
      streetVegetativeBufferPct: 50,
    });
  };

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-warning font-semibold">
              Policy &amp; Intervention Simulator
            </span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">
              Counterfactual Physics
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Environmental Scenario Laboratory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Simulate targeted interventions to model diurnally resolved concentration shifts, boundary layer recovery, and downwind spatial impacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-3 py-1.5 font-sans text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Baseline (0%)
          </button>
          <button
            onClick={handlePresetAggressive}
            className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" /> Aggressive Winter Plan
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface: Policy Sliders & Telemetry Results */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Interactive Policy Interventions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-xl font-bold text-text-primary">
              Intervention Levers
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-sans">
              Adjust municipal enforcement percentages to evaluate non-linear airshed responses.
            </p>
          </div>

          {/* Slider 1: Commercial Vehicle Diversion */}
          <div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <Truck className="h-3.5 w-3.5 text-accent" /> Commercial Vehicle Bypass Diversion
              </span>
              <span className="font-mono text-sm font-bold text-accent">
                {params.commercialVehicleDiversionPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.commercialVehicleDiversionPct}
              onChange={(e) =>
                setParams({ ...params, commercialVehicleDiversionPct: parseInt(e.target.value, 10) })
              }
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-accent"
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted font-sans">
              <span>0% (Unmitigated)</span>
              <span>Reroutes heavy diesel freight to Ring Road</span>
              <span>100% (Full Ban)</span>
            </div>
          </div>

          {/* Slider 2: Road Silt Wet Sweeping */}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <Wind className="h-3.5 w-3.5 text-data-weather" /> Street Silt Regenerative Sweeping
              </span>
              <span className="font-mono text-sm font-bold text-data-weather">
                {params.siltSweepingWetSuppressionPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.siltSweepingWetSuppressionPct}
              onChange={(e) =>
                setParams({ ...params, siltSweepingWetSuppressionPct: parseInt(e.target.value, 10) })
              }
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-data-weather"
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted font-sans">
              <span>0% (Daytime Sweeping)</span>
              <span>Pre-inversion late afternoon vacuum sweep</span>
              <span>100% Coverage</span>
            </div>
          </div>

          {/* Slider 3: Industrial Batch Modulation */}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <Factory className="h-3.5 w-3.5 text-warning" /> Industrial Furnace Cycle Modulation
              </span>
              <span className="font-mono text-sm font-bold text-warning">
                {params.industrialFurnaceKilnModulationPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.industrialFurnaceKilnModulationPct}
              onChange={(e) =>
                setParams({ ...params, industrialFurnaceKilnModulationPct: parseInt(e.target.value, 10) })
              }
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-warning"
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted font-sans">
              <span>0% (Continuous Firing)</span>
              <span>Halts nighttime firing during calm inversion</span>
              <span>100% Daytime Shift</span>
            </div>
          </div>

          {/* Slider 4: Biomass Burning Enforcement */}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <Flame className="h-3.5 w-3.5 text-danger" /> Biomass &amp; Stubble Burning Ban
              </span>
              <span className="font-mono text-sm font-bold text-danger">
                {params.biomassBurningBanEnforcementPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.biomassBurningBanEnforcementPct}
              onChange={(e) =>
                setParams({ ...params, biomassBurningBanEnforcementPct: parseInt(e.target.value, 10) })
              }
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-danger"
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted font-sans">
              <span>0% (No Patrols)</span>
              <span>Thermal drone night patrols &amp; enforcement</span>
              <span>100% Elimination</span>
            </div>
          </div>

          {/* Slider 5: Roadside Vegetative Screening */}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <TreePine className="h-3.5 w-3.5 text-data-improvement" /> Vegetative Street Canyon Buffers
              </span>
              <span className="font-mono text-sm font-bold text-data-improvement">
                {params.streetVegetativeBufferPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.streetVegetativeBufferPct}
              onChange={(e) =>
                setParams({ ...params, streetVegetativeBufferPct: parseInt(e.target.value, 10) })
              }
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-muted accent-data-improvement"
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted font-sans">
              <span>0% Unbuffered</span>
              <span>Arterial vegetative canopy screening</span>
              <span>100% Buffer</span>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Diurnal Response & Spatial Footprint */}
        <div className="lg:col-span-7 space-y-8">
          {/* Key Delta Headline Banner */}
          <div className="border-t border-b border-border-subtle py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <span className="text-text-muted">Simulated PM2.5</span>
                <div className="mt-1 font-mono text-2xl font-bold text-accent">
                  {result.simulated.pm25_ugm3} <span className="text-xs font-normal text-text-muted">µg/m³</span>
                </div>
                <span className="text-data-improvement font-mono font-bold text-xs">
                  -{result.deltas.deltaPm25_pct}% ({result.deltas.deltaPm25_ugm3} µg/m³)
                </span>
              </div>

              <div>
                <span className="text-text-muted">Boundary Layer (PBLH)</span>
                <div className="mt-1 font-mono text-2xl font-bold text-data-weather">
                  {result.simulated.pblh_m} <span className="text-xs font-normal text-text-muted">m</span>
                </div>
                <span className="text-data-weather font-mono font-bold text-xs">
                  +{result.deltas.pblhRecovery_m}m Convective Expansion
                </span>
              </div>

              <div>
                <span className="text-text-muted">Direct Ground NO2</span>
                <div className="mt-1 font-mono text-2xl font-bold text-text-primary">
                  {result.simulated.no2_ugm3} <span className="text-xs font-normal text-text-muted">µg/m³</span>
                </div>
                <span className="text-data-improvement font-mono font-bold text-xs">
                  -{result.deltas.deltaNo2_pct}% Direct Flux
                </span>
              </div>

              <div>
                <span className="text-text-muted">Wheat Yield Preserved</span>
                <div className="mt-1 font-mono text-2xl font-bold text-warning">
                  +{result.deltas.projectedWheatYieldPreservation_pct}%
                </div>
                <span className="text-text-muted text-[11px]">
                  AOT40 -{result.deltas.aot40Reduction_ppbh} ppb&middot;h
                </span>
              </div>
            </div>
          </div>

          {/* Synchronized Diurnal 24-Hour Response Curve */}
          <div className="border border-border bg-surface-elevated p-6 shadow-elevation">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Synchronized 24-Hour Diurnal Response
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 font-sans">
                  Demonstrating how pre-inversion intervention flattens peak morning (08:00) and nocturnal (22:00) spikes.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 border-b border-dashed border-danger inline-block" />
                  <span className="text-text-muted">Unmitigated Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-accent inline-block" />
                  <span className="text-accent font-medium">Counterfactual Trajectory</span>
                </div>
              </div>
            </div>

            <div className="mt-5 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.diurnalResponse} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292d29" vertical={false} />
                  <XAxis dataKey="timeLabel" stroke="#777c74" fontSize={10} tickLine={false} interval={2} />
                  <YAxis stroke="#777c74" fontSize={10} tickLine={false} unit=" µg/m³" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-sm border border-border bg-surface-elevated p-3 shadow-lg text-xs font-sans">
                            <div className="font-bold text-text-primary">{d.timeLabel} IST</div>
                            <div className="text-danger font-mono mt-1">
                              Baseline PM2.5: {d.baselinePm25} µg/m³
                            </div>
                            <div className="text-accent font-mono font-bold">
                              Counterfactual PM2.5: {d.simulatedPm25} µg/m³
                            </div>
                            <div className="text-data-improvement font-mono text-[11px] mt-0.5">
                              Suppression: -{d.deltaPm25} µg/m³
                            </div>
                            <div className="text-data-weather font-mono text-[11px]">
                              PBLH Expanded: {d.simulatedPblh_m}m (+{d.simulatedPblh_m - d.baselinePblh_m}m)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselinePm25"
                    stroke="#b95342"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="simulatedPm25"
                    stroke="#c76b45"
                    strokeWidth={2.2}
                    fill="#c76b45"
                    fillOpacity={0.15}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Downwind Spatial Footprint Analysis Across 4 Zones */}
          <div>
            <h3 className="font-display text-lg font-bold text-text-primary mb-3">
              Downwind Spatial Footprint Analysis
            </h3>
            <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
              {result.spatialFootprint.map((zone) => (
                <div key={zone.zoneId} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-sans">
                    <div>
                      <span className="font-bold text-text-primary text-sm font-display">
                        {zone.zoneName}
                      </span>
                      <span className="ml-2 text-text-muted text-[11px]">
                        ({zone.microEnvironmentType})
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-accent">
                      {zone.baselinePm25} &rarr; {zone.simulatedPm25} µg/m³{" "}
                      <span className="text-data-improvement text-xs">(-{zone.reductionPct}%)</span>
                    </div>
                  </div>

                  {/* Progress bar comparison */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      style={{ width: `${Math.min(100, zone.reductionPct * 2.2)}%` }}
                      className="h-full rounded-full bg-accent transition-all duration-300"
                    />
                  </div>

                  <div className="mt-1.5 text-[11px] text-text-muted font-sans">
                    Key Driver: <span className="text-text-secondary">{zone.dominantMitigatedDriver}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thermodynamic Feedback Interruption Box */}
          <div
            className={`border-l-2 p-4 text-xs font-sans ${
              result.thermodynamicFeedbackInterruption.isInterrupted
                ? "border-data-improvement bg-surface-elevated/80"
                : "border-warning bg-surface-elevated/80"
            }`}
          >
            <div className="font-semibold text-text-primary flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-accent" />
              Thermodynamic Aerosol-Radiation Feedback Status:{" "}
              <span
                className={
                  result.thermodynamicFeedbackInterruption.isInterrupted
                    ? "text-data-improvement"
                    : "text-warning"
                }
              >
                {result.thermodynamicFeedbackInterruption.isInterrupted
                  ? "LOOP DISRUPTED (Thermodynamic Rebound Triggered)"
                  : "LOOP ACTIVE (Self-Reinforcing Stagnation Trapping)"}
              </span>
            </div>
            <p className="mt-1 text-text-secondary leading-relaxed text-xs">
              {result.thermodynamicFeedbackInterruption.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
