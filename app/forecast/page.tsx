"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Layers, 
  MapPin, 
  Wind, 
  Satellite, 
  Activity, 
  AlertTriangle, 
  Clock,
  Info,
  PlusCircle,
  Sparkles
} from "lucide-react";
import { STATIONS, Station, Observation } from "@/backend/src/repositories/dataStore";
import { observationRepository } from "@/backend/src/repositories/observationRepository";
import { getPollutionColor } from "@/lib/theme";
import AddLocationModal from "@/components/AddLocationModal";

const AirQualityMap = dynamic(() => import("@/components/AirQualityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[550px] w-full items-center justify-center rounded-sm border border-border bg-surface font-sans text-xs text-text-muted">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 animate-spin text-accent" />
        <span>Initializing MapLibre GL Environmental Spatial Layers...</span>
      </div>
    </div>
  ),
});

const POLLUTANTS = [
  "AQI (US)", "AQI", "PM2.5", "PM10", "NO2", "SO2", "CO", "O3"
] as const;

type PollutantType = typeof POLLUTANTS[number];

export default function ExplorePage() {
  const [stations, setStations] = useState<Station[]>(STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>("kanpur_nehru");
  const [activePollutant, setActivePollutant] = useState<PollutantType>("AQI (US)");
  const [observations, setObservations] = useState<Observation[]>([]);
  const [showWind, setShowWind] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [showCanyons, setShowCanyons] = useState(true);
  const [timeStepIndex, setTimeStepIndex] = useState(4);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);

  const TIME_STEPS = ["-24h", "-18h", "-12h", "-6h", "Current Telemetry", "+6h GNN", "+12h GNN", "+24h GNN"];

  useEffect(() => {
    setObservations(observationRepository.getAllCurrent());

    fetch("/api/v1/stations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.stations && data.stations.length > 0) {
          setStations(data.stations);
        }
      })
      .catch(() => {});

    fetch("/api/v1/air-quality/current")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.observations && data.observations.length > 0) {
          setObservations(data.observations);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddStation = async (newStation: Station) => {
    setStations((prev) => [newStation, ...prev.filter((s) => s.id !== newStation.id)]);

    const immediateObs = observationRepository.getCurrentByStation(newStation.id, newStation);
    setObservations((prev) => [immediateObs, ...prev.filter((o) => o.stationId !== newStation.id)]);

    setSelectedStationId(newStation.id);
    try {
      const stored = localStorage.getItem("aeroward_custom_stations");
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newStation, ...list.filter((x: any) => x.id !== newStation.id)];
      localStorage.setItem("aeroward_custom_stations", JSON.stringify(updated));
      localStorage.setItem("aeroward_selected_station_id", newStation.id);
    } catch (e) {}

    try {
      const res = await fetch("/api/v1/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStation),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.observation) {
          const actualStation = data.station ?? newStation;
          setStations((prev) => [actualStation, ...prev.filter((s) => s.id !== newStation.id && s.id !== actualStation.id)]);
          setSelectedStationId(actualStation.id);
          setObservations((prev) => [data.observation, ...prev.filter((o) => o.stationId !== newStation.id && o.stationId !== actualStation.id)]);
          try {
            const stored = localStorage.getItem("aeroward_custom_stations");
            const list = stored ? JSON.parse(stored) : [];
            const updated = [actualStation, ...list.filter((x: any) => x.id !== newStation.id && x.id !== actualStation.id)];
            localStorage.setItem("aeroward_custom_stations", JSON.stringify(updated));
            localStorage.setItem("aeroward_selected_station_id", actualStation.id);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Backend station persistence notice:", err);
    }
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) ?? stations[0];
  const selectedObs = observations.find((o) => o.stationId === selectedStationId);

  const getMetricValue = (obs: Observation | undefined, pol: string) => {
    if (!obs) {
      return { val: null, unit: "no data" };
    }
    if (pol === "AQI (US)") return { val: obs.us_aqi ?? null, unit: "AQI-US" };
    if (pol === "AQI") return { val: obs.aqi ?? null, unit: "NAQI Index" };
    if (pol === "PM2.5") return { val: obs.pm25 ?? null, unit: "µg/m³" };
    if (pol === "PM10") return { val: obs.pm10 ?? null, unit: "µg/m³" };
    if (pol === "NO2") return { val: obs.no2 ?? null, unit: "µg/m³" };
    if (pol === "SO2") return { val: obs.so2 ?? null, unit: "µg/m³" };
    if (pol === "CO") return { val: obs.co ?? null, unit: "mg/m³" };
    if (pol === "O3") return { val: obs.o3 ?? null, unit: "µg/m³" };
    return { val: obs.pm25 ?? null, unit: "µg/m³" };
  };

  const metric = getMetricValue(selectedObs, activePollutant);
  const color = selectedObs && metric.val != null ? getPollutionColor(Number(metric.val), activePollutant) : "#a4a79f";

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">Geospatial Intelligence</span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">MapLibre GL &bull; Esri Dark Canvas</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">Interactive Air-Quality Explorer</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Continuous ground telemetry from CAAQMS monitors, River Ganga contour, street canyons, and Sentinel-5P UVAI spaceborne grids when data is available.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 font-sans text-xs font-semibold text-accent-foreground hover:bg-accent-hover transition-colors shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Location</span>
          </button>

          <div className="flex flex-wrap items-center gap-1 rounded-sm border border-border bg-surface-elevated p-1">
            {POLLUTANTS.map((pol) => (
              <button
                key={pol}
                onClick={() => setActivePollutant(pol)}
                className={`rounded-sm px-3 py-1 font-sans text-xs font-semibold transition-colors ${
                  activePollutant === pol
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                }`}
              >
                {pol}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Layers className="h-4 w-4 text-accent" />
              <h3 className="font-sans text-xs uppercase tracking-wider font-semibold text-text-primary">Atmospheric Layers</h3>
            </div>
            <div className="mt-3 space-y-2 text-xs font-sans">
              <label className="flex items-center justify-between cursor-pointer rounded p-1 hover:bg-surface-elevated">
                <span className="text-text-secondary">Kinematic Wind Vectors</span>
                <input type="checkbox" checked={showWind} onChange={(e) => setShowWind(e.target.checked)} className="rounded border-border accent-accent" />
              </label>

              <label className="flex items-center justify-between cursor-pointer rounded p-1 hover:bg-surface-elevated">
                <span className="text-text-secondary">Sentinel-5P UVAI Smoke</span>
                <input type="checkbox" checked={showSatellite} onChange={(e) => setShowSatellite(e.target.checked)} className="rounded border-border accent-accent" />
              </label>

              <label className="flex items-center justify-between cursor-pointer rounded p-1 hover:bg-surface-elevated">
                <span className="text-text-secondary">Aerodynamic Street Canyons</span>
                <input type="checkbox" checked={showCanyons} onChange={(e) => setShowCanyons(e.target.checked)} className="rounded border-border accent-accent" />
              </label>
            </div>
          </div>

          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <h3 className="font-sans text-xs uppercase tracking-wider font-semibold text-text-primary">Monitoring Stations</h3>
              </div>
              <button onClick={() => setIsAddLocationModalOpen(true)} className="text-[11px] font-sans text-accent hover:underline flex items-center gap-1 font-medium">+ Add</button>
            </div>

            <div className="mt-3 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {stations.map((st) => {
                const obs = observations.find((o) => o.stationId === st.id);
                const isSelected = st.id === selectedStationId;
                let displayVal: number | null = null;
                let displayUnit = "no data";
                if (activePollutant === "AQI (US)") {
                  displayVal = obs?.us_aqi ?? null;
                  displayUnit = "AQI (US)";
                } else if (activePollutant === "AQI") {
                  displayVal = obs?.aqi ?? null;
                  displayUnit = "NAQI";
                } else {
                  const m = getMetricValue(obs, activePollutant);
                  displayVal = m.val ?? null;
                  displayUnit = m.unit;
                }
                const stColor = displayVal != null ? getPollutionColor(displayVal, activePollutant) : "#a4a79f";

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStationId(st.id);
                      try {
                        localStorage.setItem("aeroward_selected_station_id", st.id);
                      } catch (e) {}
                    }}
                    className={`flex w-full items-center justify-between rounded-sm p-2 text-left transition-colors ${
                      isSelected ? "bg-surface-elevated border-l-2 border-accent" : "hover:bg-surface-elevated/70"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-xs font-sans text-text-primary truncate">{st.name || `${st.city} Station`}</div>
                      <div className="text-[11px] text-text-muted font-sans truncate">{st.city} &bull; {st.station_type}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span style={{ color: stColor }} className="font-mono text-xs font-bold">
                        {displayVal ?? "no data"}
                      </span>
                      <div className="text-[9px] font-sans text-text-muted">{displayUnit}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="h-[520px] w-full">
            <AirQualityMap
              stations={stations}
              observations={observations}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id)}
              activePollutant={activePollutant}
              showWindVectors={showWind}
              showSatelliteOverlay={showSatellite}
              showStreetCanyons={showCanyons}
            />
          </div>

          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center justify-between text-xs font-sans text-text-muted mb-2">
              <span className="flex items-center gap-1.5 font-medium text-text-secondary">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>Synoptic Timeline Scrubber</span>
              </span>
              <span className="text-text-primary font-medium font-sans">{TIME_STEPS[timeStepIndex]}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {TIME_STEPS.map((step, idx) => (
                <button
                  key={step}
                  onClick={() => setTimeStepIndex(idx)}
                  className={`rounded-sm py-1.5 px-2 text-[11px] font-sans transition-colors text-center ${
                    timeStepIndex === idx
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "border border-border-subtle bg-surface-elevated text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border bg-surface-elevated p-6 shadow-elevation rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-text-muted font-sans">Station Telemetry</span>
                  <span className="rounded bg-data-improvement/20 px-2 py-0.5 text-[10px] font-sans font-bold text-data-improvement">{selectedStation?.status?.toUpperCase() ?? "UNKNOWN"}</span>
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold text-text-primary">{selectedStation?.name ?? "No station selected"}</h2>
                <div className="mt-1 text-xs text-text-secondary font-sans">
                  Coordinates: <span className="font-mono">{selectedStation ? `${selectedStation.lat.toFixed(4)}°N, ${selectedStation.lng.toFixed(4)}°E` : "no data"}</span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-border-subtle sm:pl-6">
                <div className="text-xs uppercase text-text-muted font-sans">{activePollutant} Level</div>
                <div style={{ color }} className="font-display text-4xl font-bold">
                  {metric.val ?? "no data"} <span className="text-xs font-mono text-text-muted">{metric.val != null ? metric.unit : ""}</span>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1.5 flex-wrap">
                  <span className="inline-block rounded px-2 py-0.5 text-[11px] font-sans font-semibold" style={{ backgroundColor: `${color}25`, color }}>
                    {selectedObs ? ((activePollutant === "AQI (US)" ? (selectedObs.us_category ?? "no data") : (selectedObs.category ?? "no data"))) : "no data"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="border border-border-subtle bg-surface p-3 rounded-sm">
                <div className="text-[11px] text-text-muted font-sans">Street Silt Loading</div>
                <div className="mt-1 font-mono text-base font-bold text-text-primary">
                  {selectedStation?.silt_loading_gm2 ?? "no data"} <span className="text-xs text-text-muted">g/m²</span>
                </div>
              </div>

              <div className="border border-border-subtle bg-surface p-3 rounded-sm">
                <div className="text-[11px] text-text-muted font-sans">Canyon Ratio (H/W)</div>
                <div className="mt-1 font-mono text-base font-bold text-text-primary">
                  {selectedStation?.canyon_hw_ratio ?? "no data"} <span className="text-xs text-text-muted">aspect</span>
                </div>
              </div>

              <div className="border border-border-subtle bg-surface p-3 rounded-sm">
                <div className="text-[11px] text-text-muted font-sans">Boundary Layer Height</div>
                <div className="mt-1 font-mono text-base font-bold text-data-weather">
                  {selectedObs?.meteorology.pblh_m ?? "no data"} <span className="text-xs text-text-muted">m</span>
                </div>
              </div>

              <div className="border border-border-subtle bg-surface p-3 rounded-sm">
                <div className="text-[11px] text-text-muted font-sans">Sentinel-5P UVAI</div>
                <div className="mt-1 font-mono text-base font-bold text-accent">
                  {selectedObs?.satellite.tropomi_aai != null ? `+${selectedObs.satellite.tropomi_aai}` : "no data"} <span className="text-xs text-text-muted">index</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 border border-border-subtle bg-surface p-3.5 text-xs text-text-secondary rounded-sm">
              <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
              <div>
                <strong className="text-text-primary font-sans">Measurement status:</strong>
                <p className="mt-0.5 leading-relaxed text-text-muted font-sans">This explorer shows live values only when the upstream monitor or weather service returns data. If a source is unavailable, the dashboard displays “no data” instead of synthetic constants.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onAddStation={handleAddStation}
      />
    </div>
  );
}
