"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  ShieldAlert,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  HelpCircle,
  History,
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
  ReferenceLine,
} from "recharts";
import { STATIONS, Station } from "@/backend/src/repositories/dataStore";
import { generateShortTermForecast } from "@/backend/src/forecasting/shortTermModel";
import { generateLongRangeForecast } from "@/backend/src/forecasting/longRangeModel";
import { getPollutionColor } from "@/lib/theme";

const SHORT_HORIZONS = ["12h", "24h", "48h", "72h"] as const;
const LONG_HORIZONS = ["1m", "2m", "3m", "4m", "5m", "6m", "7m"] as const;

export default function ForecastPage() {
  const [stations, setStations] = useState<Station[]>(STATIONS);
  const [selectedStationId, setSelectedStationId] = useState("kanpur_nehru");
  const [selectedPollutant, setSelectedPollutant] = useState("PM2.5");
  const [forecastType, setForecastType] = useState<"short" | "long">("short");
  const [shortHorizon, setShortHorizon] = useState<"12h" | "24h" | "48h" | "72h">("72h");
  const [longHorizon, setLongHorizon] = useState<"1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "7m">("7m");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aeroward_custom_stations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStations((prev) => [...parsed, ...prev.filter((p) => !parsed.some((x: any) => x.id === p.id))]);
        }
      }
    } catch (e) {}

    fetch("/api/v1/stations")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.stations && data.stations.length > 0) {
          try {
            const stored = localStorage.getItem("aeroward_custom_stations");
            const parsed = stored ? JSON.parse(stored) : [];
            const merged = [...parsed, ...data.stations.filter((p: any) => !parsed.some((x: any) => x.id === p.id))];
            setStations(merged);
          } catch {
            setStations(data.stations);
          }
        }
      })
      .catch((err) => console.warn("Notice: Live station sync in forecast:", err));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("stationId");
      if (urlId) {
        setSelectedStationId(urlId);
      } else {
        const lastSelected = localStorage.getItem("aeroward_selected_station_id");
        if (lastSelected) setSelectedStationId(lastSelected);
      }
    }
  }, []);

  const handleStationChange = (id: string) => {
    setSelectedStationId(id);
    try {
      localStorage.setItem("aeroward_selected_station_id", id);
    } catch (e) {}
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) ?? stations[0];

  const shortResult = useMemo(() => {
    return generateShortTermForecast(selectedStationId, selectedPollutant, shortHorizon, selectedStation);
  }, [selectedStationId, selectedPollutant, shortHorizon, selectedStation]);

  const longMonthsCount = useMemo(() => {
    const parsed = parseInt(longHorizon.replace(/[^0-9]/g, ""), 10);
    return isNaN(parsed) || parsed < 1 ? 7 : Math.min(parsed, 7);
  }, [longHorizon]);

  const longResult = useMemo(() => {
    return generateLongRangeForecast(selectedStationId, selectedPollutant, longMonthsCount, selectedStation);
  }, [selectedStationId, selectedPollutant, longMonthsCount, selectedStation]);

  const chartData = useMemo(() => {
    if (forecastType === "short") {
      return shortResult.points.map((pt) => ({
        label: `+${pt.stepHour}h`,
        time: new Date(pt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        predicted: pt.predictedValue,
        lower95: pt.lower95,
        upper95: pt.upper95,
        pblh: pt.pblh_m,
        aqi: pt.predictedAqi,
        category: pt.aqiCategory,
        isHistorical: false,
      }));
    } else {
      const historicalPoints = longResult.historicalTrailingMonths.map((h) => ({
        label: `${h.monthName.slice(0, 3)} '${String(h.year).slice(2)}`,
        fullMonth: `${h.monthName} ${h.year} (Observed History)`,
        predicted: h.observedMean,
        observed: h.observedMean,
        climatology: h.climatologicalMean,
        lower68: undefined,
        upper68: undefined,
        lower95: undefined,
        upper95: undefined,
        driver: "Historical Baseline Observations",
        risk: "Historical Telemetry",
        isHistorical: true,
      }));

      const futurePoints = longResult.forecastMonths.map((m) => ({
        label: `${m.monthName.slice(0, 3)} '${String(m.year).slice(2)}`,
        fullMonth: `${m.monthName} ${m.year} (Projected)`,
        predicted: m.predictedValue,
        observed: undefined,
        climatology: m.climatologicalMean,
        lower68: m.uncertaintyInterval68[0],
        upper68: m.uncertaintyInterval68[1],
        lower95: m.uncertaintyInterval95[0],
        upper95: m.uncertaintyInterval95[1],
        driver: m.dominantSeasonalDriver,
        risk: m.historicalAnomalyRisk,
        pblh: m.projectedPblhMean_m,
        isHistorical: false,
      }));

      return [...historicalPoints, ...futurePoints];
    }
  }, [forecastType, shortResult, longResult]);

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-accent font-semibold">Predictive Atmospheric Modeling</span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">Simulation only</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">Multi-Horizon Air Quality Forecast Engine</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">This forecast page is a simulated demo and does not claim a production validation set yet.</p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <select value={selectedStationId} onChange={(e) => handleStationChange(e.target.value)} className="rounded-sm border border-border bg-surface-elevated px-3 py-1.5 font-sans text-xs text-text-primary focus:border-accent focus:outline-none">
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-text-muted font-sans tracking-wider">Paradigm:</span>
          <div className="inline-flex rounded-sm border border-border bg-surface-elevated p-1">
            <button onClick={() => setForecastType("short")} className={`rounded-sm px-4 py-1.5 font-sans text-xs font-semibold transition-colors ${forecastType === "short" ? "bg-accent text-accent-foreground shadow-sm" : "text-text-secondary hover:text-text-primary"}`} >Short-Term (12–72 Hours)</button>
            <button onClick={() => setForecastType("long")} className={`rounded-sm px-4 py-1.5 font-sans text-xs font-semibold transition-colors ${forecastType === "long" ? "bg-accent text-accent-foreground shadow-sm" : "text-text-secondary hover:text-text-primary"}`} >Long-Range Outlook (1–7 Months)</button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted font-sans mr-1">Horizon:</span>
          {forecastType === "short" ? (
            SHORT_HORIZONS.map((h) => (
              <button key={h} onClick={() => setShortHorizon(h)} className={`rounded-sm px-3 py-1 font-mono text-xs transition-colors ${shortHorizon === h ? "border border-accent bg-surface-elevated text-accent font-bold" : "border border-border-subtle bg-surface hover:bg-surface-elevated text-text-secondary"}`} >{h}</button>
            ))
          ) : (
            LONG_HORIZONS.map((h) => (
              <button key={h} onClick={() => setLongHorizon(h)} className={`rounded-sm px-2.5 py-1 font-mono text-xs transition-colors ${longHorizon === h ? "border border-accent bg-surface-elevated text-accent font-bold" : "border border-border-subtle bg-surface hover:bg-surface-elevated text-text-secondary"}`} >{h.toUpperCase()}</button>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 border border-border bg-surface-elevated p-6 shadow-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle pb-4">
          <div>
            <div className="text-xs text-text-muted font-sans">
              {forecastType === "short" ? shortResult.modelArchitecture : longResult.modelArchitecture}
            </div>
            <h2 className="mt-0.5 font-display text-xl font-bold text-text-primary">
              {forecastType === "short" ? `${selectedPollutant} Projection over ${shortHorizon} Horizon` : `${selectedPollutant} Climatological Trend over ${longMonthsCount}-Month Horizon`}
            </h2>
          </div>
        </div>

        <div className="mt-6 h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 35, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#292d29" vertical={false} />
              <XAxis dataKey="label" stroke="#777c74" fontSize={11} tickLine={false} />
              <YAxis stroke="#777c74" fontSize={11} tickLine={false} unit=" µg/m³" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-sm border border-border bg-surface-elevated p-3 shadow-lg text-xs font-sans">
                        <div className="font-bold text-text-primary">{forecastType === "short" ? `${data.label} (${data.time})` : data.fullMonth}</div>
                        <div className="mt-1 text-accent font-mono font-bold">{data.isHistorical ? "Observed" : "Predicted"} {selectedPollutant}: {data.predicted} µg/m³</div>
                        {data.climatology != null && (<div className="text-data-weather font-mono text-[11px]">Climatological Norm: {data.climatology} µg/m³</div>)}
                        {data.lower95 != null && (<div className="text-text-muted font-mono text-[11px]">95% Confidence: [{data.lower95}, {data.upper95}] µg/m³</div>)}
                        {forecastType === "short" ? (<div className="mt-1 text-data-weather text-[11px] font-mono">Modeled PBLH: {data.pblh}m &bull; {data.category}</div>) : (<div className="mt-1 text-warning text-[11px]">Seasonal Driver: {data.driver}</div>)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={60} stroke="#86a98a" strokeDasharray="4 4" label={{ value: "NAAQ Standard 60", fill: "#86a98a", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={250} stroke="#b95342" strokeDasharray="4 4" label={{ value: "Severe 250", fill: "#b95342", fontSize: 10, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="upper95" stroke="none" fill="#c76b45" fillOpacity={0.14} />
              <Area type="monotone" dataKey="lower95" stroke="none" fill="#181a18" fillOpacity={1.0} />
              {forecastType === "long" && (<Line type="monotone" dataKey="climatology" stroke="#82b8c5" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />)}
              <Line type="monotone" dataKey="predicted" stroke="#c76b45" strokeWidth={2.5} dot={{ r: 3.5, fill: "#c76b45", stroke: "#eeeee8", strokeWidth: 1 }} activeDot={{ r: 6, fill: "#dc8057" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-4 text-xs font-sans">
          <div>
            <div className="text-text-muted uppercase tracking-wider text-[10px]">Chronological MAE</div>
            <div className="text-sm font-mono font-bold text-text-primary mt-0.5">No validation set</div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wider text-[10px]">Test Set RMSE</div>
            <div className="text-sm font-mono font-bold text-text-primary mt-0.5">No validation set</div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wider text-[10px]">Skill vs Persistence</div>
            <div className="text-sm font-mono font-bold text-accent mt-0.5">No validation set</div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wider text-[10px]">Confidence Coverage</div>
            <div className="text-sm font-mono font-bold text-text-primary mt-0.5">No validation set</div>
          </div>
        </div>
      </div>
    </div>
  );
}
