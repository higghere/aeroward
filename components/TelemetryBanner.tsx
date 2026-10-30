"use client";

import { useState } from "react";
import { Info, X, Radio } from "lucide-react";

export default function TelemetryBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Airshed Status and Calibration" className="border-b border-border-subtle bg-surface-muted/80 px-4 py-1.5 text-xs text-text-secondary">
      <div className="mx-auto flex max-w-content items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-data-improvement animate-pulse" />
          <span className="font-mono text-[11px] text-text-muted">ACTIVE AIRSHED:</span>
          <span className="font-medium text-text-primary">Kanpur &amp; Central Indo-Gangetic Basin</span>
          <span className="hidden md:inline text-text-muted">&bull;</span>
          <span className="hidden md:inline text-text-muted">
            Calibrated against CPCB CAAQMS &amp; Sentinel-5P TROPOMI UVAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-accent">
            <Radio className="h-3 w-3" /> DEMO MODE ACTIVE
          </span>
          <button
            onClick={() => setVisible(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss airshed telemetry notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
