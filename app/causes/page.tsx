"use client";

import { useState } from "react";
import { 
  Flame, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Wheat,
  Thermometer,
  Layers
} from "lucide-react";
import { sourceApportionmentService } from "@/backend/src/analysis/sourceApportionmentService";
import { meteorologyService } from "@/backend/src/analysis/meteorologyService";

export default function CausesPage() {
  const [selectedSeason, setSelectedSeason] = useState<"Winter" | "Summer">("Winter");
  const sourceData = sourceApportionmentService.getSourceAnalysis("Kanpur");
  const metData = meteorologyService.getAtmosphericAnalysis("Kanpur");

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-danger font-semibold">
              Atmospheric Diagnostic &bull; Receptor Speciation
            </span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">
              Kanpur Airshed
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Pollution-Factor &amp; Source Analysis
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Multi-site chemical mass balance, optical carbon speciation, and planetary boundary layer thermodynamics.
          </p>
        </div>

        {/* Season Regime Selector */}
        <div className="flex items-center gap-1 rounded-sm border border-border bg-surface-elevated p-1 text-xs">
          <span className="text-text-muted px-2 font-sans">Regime:</span>
          <button
            onClick={() => setSelectedSeason("Winter")}
            className={`rounded-sm px-3 py-1 font-sans font-semibold transition-colors ${
              selectedSeason === "Winter"
                ? "bg-pollution-severe text-accent-foreground shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Winter Stagnation
          </button>
          <button
            onClick={() => setSelectedSeason("Summer")}
            className={`rounded-sm px-3 py-1 font-sans font-semibold transition-colors ${
              selectedSeason === "Summer"
                ? "bg-pollution-low text-background shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Summer Convection
          </button>
        </div>
      </div>

      {/* Prominent Scientific Causality Notice */}
      <div className="mt-6 border-l-2 border-accent bg-surface-elevated/70 p-4 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-accent mt-0.5" />
          <div className="space-y-1">
            <strong className="font-sans font-semibold text-accent uppercase tracking-wider text-[11px]">
              Scientific Causality vs Statistical Association Notice
            </strong>
            <p className="text-text-secondary leading-relaxed font-sans">
              Machine learning feature attributions (SHAP or permutation weights) reveal predictive feature dependencies within the model but <strong>do not independently demonstrate physical causality</strong>. Ground truth source apportionment requires receptor mass balance (CMB), positive matrix factorization (PMF), and optical carbon tracers (EC/OC).
            </p>
          </div>
        </div>
      </div>

      {/* Seasonal Ambient Context Comparison - Multi-Column Metric Bar */}
      <div className="mt-8 border-t border-b border-border-subtle py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
          <div className="md:pr-6">
            <div className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Kanpur Ambient PM2.5 Mean
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-text-primary">
              {selectedSeason === "Winter" ? "238 ± 96" : "78 ± 23"}{" "}
              <span className="font-mono text-sm font-normal text-text-muted">µg/m³</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              {selectedSeason === "Winter"
                ? "Severe winter stagnation regime governed by shallow radiational inversions and calm surface winds."
                : "Pre-monsoon summer regime dominated by convective crustal dust suspension and deep boundary-layer mixing."}
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6">
            <div className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Planetary Boundary Layer Height
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-data-weather">
              {selectedSeason === "Winter" ? "320" : "1,450"}{" "}
              <span className="font-mono text-sm font-normal text-text-muted">meters</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              {selectedSeason === "Winter"
                ? "Compressed mixing volume traps primary emissions close to the surface, accelerating secondary aerosol formation."
                : "Intense solar insolation drives deep convective thermals up to 1,800m, rapidly dispersing surface emissions aloft."}
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:pl-6">
            <div className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Dominant Chemical Speciation
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-warning">
              {selectedSeason === "Winter" ? "~61%" : "~28%"}{" "}
              <span className="font-sans text-sm font-normal text-text-muted">
                {selectedSeason === "Winter" ? "EC+OC &amp; SIA" : "Mineral Crustal"}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              {selectedSeason === "Winter"
                ? "Combustion-derived elemental and organic carbon plus secondary ammonium nitrate and sulfate."
                : "Wind-shear suspension of mineral soil crustal silicates, aluminum, and calcium from unpaved roads."}
            </p>
          </div>
        </div>
      </div>

      {/* Source Apportionment Sector Breakdown - Flush Tabular Breakdown */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-border-strong pb-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Sectoral Source Apportionment Matrix
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-sans">
              Calibrated against Chemical Mass Balance (CMB) and PMF receptor speciation across Kanpur monitoring stations ({selectedSeason} Regime).
            </p>
          </div>
          <span className="mt-2 sm:mt-0 font-sans text-xs text-text-muted">
            Ranked by mass fraction
          </span>
        </div>

        {/* Flush Tabular List */}
        <div className="divide-y divide-border-subtle">
          {sourceData.sectors.map((sec, idx) => {
            const range = selectedSeason === "Winter" ? sec.winterContributionRange : sec.summerContributionRange;
            const midVal = Number(((range[0] + range[1]) / 2).toFixed(1));

            return (
              <div key={idx} className="py-5 transition-colors hover:bg-surface-elevated/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-text-primary">
                        {sec.sector}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-text-muted font-sans">
                      Chemical Fingerprint: <span className="text-text-secondary">{sec.chemicalFingerprint}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                      <span className="text-text-muted">Mass Contribution</span>
                      <span className="font-mono text-sm font-bold text-accent">
                        {range[0]}% – {range[1]}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        style={{ width: `${Math.min(100, midVal * 2.8)}%` }}
                        className="h-full rounded-full bg-accent transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 text-xs font-sans text-text-secondary leading-relaxed pl-0 md:pl-4 border-l-0 md:border-l border-border-subtle">
                    <span className="text-text-muted font-medium">Intervention:</span>{" "}
                    {sec.actionableMitigation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atmospheric Meteorology & Thermodynamics Deep Dive - Multi-Column Editorial Grid */}
      <div className="mt-14 border-t border-border-subtle pt-10">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-6">
          Thermodynamic Mechanisms &amp; Agro-Ecosystem Thresholds
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
          {/* Panel 1: Synoptic Stagnation & Boundary Layer Trapping */}
          <div className="lg:pr-8">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-data-weather" />
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-text-primary">
                Synoptic Stagnation Thresholds
              </h3>
            </div>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              Wind speeds below 1.5 m/s combined with nocturnal boundary layer compression below 350m indicate acute stagnation, halting horizontal advective flushing.
            </p>

            <div className="mt-4 divide-y divide-border-subtle border-t border-b border-border-subtle text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">Surface Wind Speed</span>
                <span className="font-mono text-danger font-semibold">1.2 m/s (&lt; 1.5 m/s Critical Threshold)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">Thermal Inversion Gradient</span>
                <span className="font-mono text-warning font-semibold">2.8 °C / 100m (Stable Stratification)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">Relative Humidity</span>
                <span className="font-mono text-data-weather font-semibold">74% (Aqueous SIA Acceleration)</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-text-muted leading-relaxed font-sans">
              When relative humidity exceeds 70% under stagnant airflow, heterogeneous aqueous oxidation of SO₂ and NO₂ accelerates, increasing secondary aerosol mass by up to 35% overnight.
            </p>
          </div>

          {/* Panel 2: Photochemical Ozone & Wheat Yield Loss */}
          <div className="pt-8 lg:pt-0 lg:pl-8">
            <div className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-warning" />
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-text-primary">
                Agro-Ecosystem Risk: AOT40 Ozone Metric
              </h3>
            </div>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
              AOT40 measures accumulated exposure to tropospheric ozone above 40 ppb during daytime daylight hours, quantifying physiological injury to northern Indian winter wheat (<em>Triticum aestivum</em>).
            </p>

            <div className="mt-4 divide-y divide-border-subtle border-t border-b border-border-subtle text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">Accumulated AOT40 Metric</span>
                <span className="font-mono text-danger font-bold">3,640 ppb&middot;h</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">UN-ECE Critical Safety Ceiling</span>
                <span className="font-mono text-text-primary font-semibold">3,000 ppb&middot;h</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-text-muted font-sans">Modeled Crop Yield Impact</span>
                <span className="font-mono text-danger font-semibold">-6.4% to -14.9% Relative Yield</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-text-muted leading-relaxed font-sans">
              Ozone enters plant foliage through stomatal pores during daytime gas exchange, triggering cellular oxidative stress that damages chloroplast membranes and reduces grain weight during anthesis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
