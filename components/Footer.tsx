import Link from "next/link";
import { Wind, ShieldAlert, Cpu, Database, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface text-text-secondary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: Brand & Scientific Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-surface-elevated text-accent">
                <Wind className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold text-text-primary">
                AEROWARD INTELLIGENCE
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-text-secondary">
              Predictive micro-climate intelligence and proactive environmental regulation platform.
              Rooted in the peer-reviewed foundational study: <em>&ldquo;Architectural Blueprint for Predictive Air Quality Intelligence: Modeling Paradigms, Citizen Exposure Mitigation, and Proactive Urban Ecosystem Regulation.&rdquo;</em>
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-elevated px-2 py-0.5 font-mono text-[11px] text-text-muted">
                <Cpu className="h-3 w-3 text-data-weather" /> Node.js &bull; TypeScript Backend
              </span>
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-elevated px-2 py-0.5 font-mono text-[11px] text-text-muted">
                <Database className="h-3 w-3 text-pollution-low" /> PostGIS Spatial Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-elevated px-2 py-0.5 font-mono text-[11px] text-text-muted">
                <BookOpen className="h-3 w-3 text-accent" /> Kanpur &bull; IGP Case Study
              </span>
            </div>
          </div>

          {/* Column 2: Core Platform Routes */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-text-primary">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-accent transition-colors">
                  Air Quality Explorer &amp; MapLibre
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="hover:text-accent transition-colors">
                  Multi-Horizon Forecast Engine
                </Link>
              </li>
              <li>
                <Link href="/causes" className="hover:text-accent transition-colors">
                  Receptor Source Apportionment
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-accent transition-colors">
                  Predictive GRAP &amp; BMS Dispatch
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-accent transition-colors">
                  Micro-Exposure Navigation
                </Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-accent transition-colors">
                  Environmental Scenario Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Data Provenance & Methodology */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-text-primary">
              Provenance &amp; Research
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/history" className="hover:text-accent transition-colors">
                  Episodic Stagnation Timeline
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-accent transition-colors">
                  Scientific Methodology &amp; GNNs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  Data Sources &amp; Transparency
                </Link>
              </li>
              <li className="pt-2 text-text-muted">
                Sources: CPCB, UPPCB, Copernicus Sentinel-5P TROPOMI, ECMWF ERA5, IIT Kanpur.
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-10 border-t border-border-subtle pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 max-w-2xl text-[11px] text-text-muted leading-relaxed">
              <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
              <span>
                <strong>SCIENTIFIC &amp; HEALTH NOTICE:</strong> AeroWard provides modeled environmental intelligence and simulated counterfactual scenarios. Long-range (1–7 month) forecasts are experimental statistical baselines distinct from short-term validated spatiotemporal GNNs. Inhalation dosage estimates do not constitute individual medical diagnosis or official municipal regulatory mandates.
              </span>
            </div>
            <p className="font-mono text-[11px] text-text-muted">
              &copy; 2026 AeroWard Platform. Production Architecture.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
