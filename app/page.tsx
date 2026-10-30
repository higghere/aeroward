"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Database, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Compass, 
  Flame, 
  Navigation, 
  ShieldCheck, 
  Sliders, 
  ThermometerSnowflake 
} from "lucide-react";
import AtmosphericHeroCanvas from "@/components/AtmosphericHeroCanvas";

export default function HomePage() {
  return (
    <div className="relative">
      {/* 1. CINEMATIC HERO SECTION WITH GSAP ATMOSPHERIC CANVAS */}
      <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden border-b border-border-subtle bg-background">
        <AtmosphericHeroCanvas />

        <div className="relative z-10 mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-text-secondary backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-sans font-medium">Predictive Air Quality Intelligence</span>
              <span className="text-border-strong">&bull;</span>
              <span className="text-text-muted">Kanpur &amp; Indo-Gangetic Basin Airshed</span>
            </div>

            <h1 className="mt-6 font-display text-4xl sm:text-6xl font-bold tracking-tight text-text-primary leading-[1.12]">
              Understand the air. Anticipate the change. <br />
              <span className="text-accent italic font-normal">Act before the exposure.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed font-sans max-w-2xl">
              A predictive air quality intelligence platform grounded in atmospheric boundary-layer physics, spatiotemporal deep learning, micro-exposure street canyon routing, and proactive municipal intervention.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-accent-foreground transition-all hover:bg-accent-hover shadow-elevation"
              >
                Launch Geospatial Explorer <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/forecast"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-5 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-text-primary transition-all hover:border-border-strong hover:bg-surface-elevated"
              >
                12h–72h &amp; 1–7m Forecasts
              </Link>
            </div>
          </div>
        </div>

        {/* Live Environmental Telemetry Banner */}
        <div className="border-t border-border-subtle bg-surface/60 backdrop-blur-sm px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-content grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs">
            <div>
              <div className="text-[11px] font-sans text-text-muted">Domain Region</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans font-medium text-text-primary">
                <MapPin className="h-3 w-3 text-accent" /> Kanpur, UP (IGP)
              </div>
            </div>

            <div>
              <div className="text-[11px] font-sans text-text-muted">Synoptic Sync</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans font-medium text-text-primary">
                <Clock className="h-3 w-3 text-data-weather" /> 15m Ground &amp; S-5P
              </div>
            </div>

            <div>
              <div className="text-[11px] font-sans text-text-muted">Observation Grid</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans font-medium text-text-primary">
                <Database className="h-3 w-3 text-pollution-low" /> CAAQMS &bull; UVAI
              </div>
            </div>

            <div>
              <div className="text-[11px] font-sans text-text-muted">Lead Windows</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans font-medium text-text-primary">
                <TrendingUp className="h-3 w-3 text-warning" /> 12h–72h &bull; 1m–7m
              </div>
            </div>

            <div>
              <div className="text-[11px] font-sans text-text-muted">PBLH &amp; Advection</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-danger font-medium">
                <ThermometerSnowflake className="h-3 w-3" /> 320m &bull; &lt;1.5 m/s
              </div>
            </div>

            <div>
              <div className="text-[11px] font-sans text-text-muted">Engine Status</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-sans font-medium text-accent">
                <Radio className="h-3 w-3 animate-pulse" /> Calibrated Engine
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE ESSENTIAL QUESTIONS - EDITORIAL ASYMMETRIC GRID */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-border-subtle bg-surface">
        <div className="mx-auto max-w-content">
          <div className="max-w-2xl">
            <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">
              Scientific Decision Framework
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-text-primary">
              Five Essential Questions Answered
            </h2>
            <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed font-sans">
              Air quality intelligence transforms from a passive visual dashboard into a proactive decision-making engine by answering five fundamental questions as a unified operational system.
            </p>
          </div>

          <div className="mt-14 divide-y divide-border-subtle border-t border-b border-border-subtle">
            {/* Question 01 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors hover:bg-surface-elevated/40 px-2 sm:px-4">
              <div className="md:col-span-1 font-display text-2xl font-bold text-accent">01</div>
              <div className="md:col-span-4">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  What is happening?
                </h3>
                <span className="mt-1 inline-block text-xs text-text-muted font-sans">
                  Current &amp; Historical Ground Telemetry
                </span>
              </div>
              <div className="md:col-span-5 text-sm text-text-secondary leading-relaxed">
                Continuous ground observations from Continuous Ambient Air Quality Monitoring Stations (CAAQMS) coupled with Sentinel-5P TROPOMI UV absorbing aerosol indices across the Kanpur airshed.
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <Link href="/explore" className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
                  Air Quality Map <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Question 02 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors hover:bg-surface-elevated/40 px-2 sm:px-4">
              <div className="md:col-span-1 font-display text-2xl font-bold text-warning">02</div>
              <div className="md:col-span-4">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  What is likely to happen next?
                </h3>
                <span className="mt-1 inline-block text-xs text-text-muted font-sans">
                  Dual-Horizon Spatiotemporal Forecasting
                </span>
              </div>
              <div className="md:col-span-5 text-sm text-text-secondary leading-relaxed">
                Sub-second 12- to 72-hour multi-step forecasting via Spatiotemporal Graph Neural Networks (A3T-GCN), alongside a separately developed 1–7-month seasonal climatology ensemble with progressive uncertainty intervals.
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <Link href="/forecast" className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
                  Forecast Engine <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Question 03 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors hover:bg-surface-elevated/40 px-2 sm:px-4">
              <div className="md:col-span-1 font-display text-2xl font-bold text-danger">03</div>
              <div className="md:col-span-4">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Why is it happening?
                </h3>
                <span className="mt-1 inline-block text-xs text-text-muted font-sans">
                  Receptor Speciation &amp; Meteorological Triggers
                </span>
              </div>
              <div className="md:col-span-5 text-sm text-text-secondary leading-relaxed">
                Receptor modeling and chemical mass balance separating vehicular exhaust (29.9% winter), secondary inorganic aerosols (30%), crustal silt, and biomass stubble burning trapped by boundary layer thermal inversions.
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <Link href="/causes" className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
                  Pollution Drivers <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Question 04 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors hover:bg-surface-elevated/40 px-2 sm:px-4">
              <div className="md:col-span-1 font-display text-2xl font-bold text-accent">04</div>
              <div className="md:col-span-4">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  Where could exposure become a concern?
                </h3>
                <span className="mt-1 inline-block text-xs text-text-muted font-sans">
                  Street Canyon Aerodynamics &amp; Clean Navigation
                </span>
              </div>
              <div className="md:col-span-5 text-sm text-text-secondary leading-relaxed">
                Urban street canyon aerodynamics: building aspect ratios (H/W ≥ 1.0) creating leeward vortices that trap direct vehicular exhaust, doubling pedestrian sidewalk exposure compared to windward greenway corridors.
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <Link href="/routes" className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
                  Clean Navigation <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Question 05 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors hover:bg-surface-elevated/40 px-2 sm:px-4">
              <div className="md:col-span-1 font-display text-2xl font-bold text-data-improvement">05</div>
              <div className="md:col-span-4">
                <h3 className="font-display text-xl font-bold text-text-primary">
                  What can be done about it?
                </h3>
                <span className="mt-1 inline-block text-xs text-text-muted font-sans">
                  Predictive GRAP, School, Hospital &amp; Citizen Guidance
                </span>
              </div>
              <div className="md:col-span-5 text-sm text-text-secondary leading-relaxed">
                Predictive Graded Response Action Plans (GRAP): 12–36 hour advance dispatch of late afternoon vacuum street sweeping, freight diversions, hospital ward pre-filtration, and school arrival delay advisories.
              </div>
              <div className="md:col-span-2 flex md:justify-end">
                <Link href="/solutions" className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
                  Predictive Actions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCIENTIFIC SPOTLIGHT: KANPUR RESEARCH STUDY */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-border-subtle bg-background">
        <div className="mx-auto max-w-content">
          <div className="border-l-2 border-accent pl-6">
            <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">
              Research Study Focus Area
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-text-primary">
              The Kanpur Airshed &amp; Indo-Gangetic Basin Case Study
            </h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed font-sans max-w-3xl">
              As established in the foundational paper <em>&ldquo;Architectural Blueprint for Predictive Air Quality Intelligence,&rdquo;</em> Kanpur serves as a critical natural atmospheric laboratory exhibiting intense seasonal contrasts, complex street canyons, and strong aerosol-radiation-meteorology feedback loops.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-border-strong pt-4">
              <div className="text-xs font-sans text-text-muted">Summer Ground Observations</div>
              <div className="mt-1 font-mono text-2xl font-bold text-warning">
                78 <span className="text-sm font-normal text-text-muted">&plusmn; 23 µg/m³</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Empirical baseline from Kanpur study. Dominated by crustal dust storms and strong convective boundary-layer mixing up to 1,800m.
              </p>
            </div>

            <div className="border-t border-border-strong pt-4">
              <div className="text-xs font-sans text-text-muted">Winter Ground Observations</div>
              <div className="mt-1 font-mono text-2xl font-bold text-danger">
                238 <span className="text-sm font-normal text-text-muted">&plusmn; 96 µg/m³</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Empirical baseline from Kanpur study. Dominated by vehicular exhaust (29.9%), secondary aerosols (30%), and biomass space heating.
              </p>
            </div>

            <div className="border-t border-border-strong pt-4">
              <div className="text-xs font-sans text-text-muted">Winter Carbonaceous Fraction</div>
              <div className="mt-1 font-mono text-2xl font-bold text-accent">
                ~60% <span className="text-sm font-normal text-text-muted">Organic + Black Carbon</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                High absorbing fraction (OC + BC + Secondary Inorganic Aerosols) triggering strong upper boundary layer solar absorption.
              </p>
            </div>

            <div className="border-t border-border-strong pt-4">
              <div className="text-xs font-sans text-text-muted">Boundary Layer Inversion Trap</div>
              <div className="mt-1 font-mono text-2xl font-bold text-data-weather">
                &lt; 350m <span className="text-sm font-normal text-text-muted">Nocturnal Height</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Aerosol cooling of the surface suppresses vertical thermal mixing, trapping subsequent emissions in an escalating feedback loop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ASYMMETRIC EDITORIAL SITEMAP DIRECTORY */}
      <section className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Context & Editorial Statement */}
            <div className="lg:col-span-4">
              <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">
                Operational Directory
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-text-primary leading-tight">
                AeroWard Intelligence Suite
              </h2>
              <p className="mt-4 text-sm text-text-secondary leading-relaxed font-sans">
                A unified architecture connecting spaceborne Earth observation, ground sensor networks, deep spatiotemporal models, micro-exposure routing, and municipal regulation.
              </p>

              <div className="mt-8 border-t border-border-subtle pt-6">
                <Link
                  href="/research"
                  className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
                >
                  Scientific Blueprint &amp; Formulations <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Right Column: Structured Text-and-Line Directory */}
            <div className="lg:col-span-8 divide-y divide-border-subtle border-t border-b border-border-subtle">
              {/* Category 1: Spatial & Temporal Observation */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 text-xs uppercase tracking-wider text-text-muted font-sans font-medium">
                  Observation
                </div>
                <div className="sm:col-span-9 space-y-4">
                  <Link
                    href="/explore"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Interactive Air-Quality Explorer
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        MapLibre GL layers for ground CAAQMS, River Ganga contour, street canyons, and Sentinel-5P UVAI.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>

                  <Link
                    href="/history"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Episodic Event Timeline &amp; History
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Multi-day episodic anomalies: agricultural burning plumes, winter nocturnal inversions, and rain washouts.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Category 2: Predictive Modeling */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 text-xs uppercase tracking-wider text-text-muted font-sans font-medium">
                  Forecasting
                </div>
                <div className="sm:col-span-9 space-y-4">
                  <Link
                    href="/forecast"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Multi-Horizon Forecast Engine
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        A3T-GCN spatiotemporal short-term projections (12h–72h) and separate 1–7m seasonal climatology with progressive uncertainty.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Category 3: Atmospheric Diagnostics */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 text-xs uppercase tracking-wider text-text-muted font-sans font-medium">
                  Diagnostics
                </div>
                <div className="sm:col-span-9 space-y-4">
                  <Link
                    href="/causes"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Pollution-Factor &amp; Source Analysis
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Chemical Mass Balance, PMF receptor apportionment, photochemical ozone, and AOT40 agricultural risk.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>

                  <Link
                    href="/scenarios"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Environmental Scenario Laboratory
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Interactive counterfactual simulations with diurnal response curves and downwind zonal footprint modeling.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Category 4: Targeted Interventions */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 text-xs uppercase tracking-wider text-text-muted font-sans font-medium">
                  Interventions
                </div>
                <div className="sm:col-span-9 space-y-4">
                  <Link
                    href="/routes"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Clean-Air Micro-Exposure Navigation
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Interactive OD corridor synthesis and inhaled dose integration across street canyons and greenways.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>

                  <Link
                    href="/solutions"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        Predictive Mitigation &amp; Persona Advisories
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        12–36h advance municipal GRAP, school outdoor schedules, hospital pre-intake filtering, and citizen mask guidance.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>

                  <Link
                    href="/about"
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors hover:text-accent"
                  >
                    <div>
                      <span className="font-display text-base font-bold text-text-primary group-hover:text-accent">
                        System Architecture &amp; Data Governance
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Full-stack Node.js + Fastify engine provenance, PostGIS spatial models, and CPCB/Sentinel-5P data registry.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-2 sm:mt-0 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
