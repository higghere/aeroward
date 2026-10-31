"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  MapPin,
  Flame,
  CloudRain,
  ThermometerSnowflake,
  Wind,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { STATIONS, Station } from "@/backend/src/repositories/dataStore";
import { observationRepository } from "@/backend/src/repositories/observationRepository";
import { getPollutionColor } from "@/lib/theme";

export default function HistoryPage() {
  const [stations, setStations] = useState<Station[]>(STATIONS);
  const [selectedStationId, setSelectedStationId] = useState("kanpur_nehru");
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [selectedPollutant, setSelectedPollutant] = useState<"PM2.5" | "PM10" | "NO2" | "AQI">("PM2.5");
  const [activeEventFilter, setActiveEventFilter] = useState<string | null>(null);

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
      .catch((err) => console.warn("Notice: Live station sync in history:", err));

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

  const historicalRecords = useMemo(() => {
    return observationRepository.getHistorical(selectedStationId, selectedDays, selectedStation);
  }, [selectedStationId, selectedDays, selectedStation]);

  const chartData = useMemo(() => {
    return historicalRecords.map((rec) => {
      const d = new Date(rec.date);
      const val = selectedPollutant === "AQI" ? rec.aqi : selectedPollutant === "PM2.5" ? rec.pm25 : selectedPollutant === "PM10" ? rec.pm10 : rec.no2;

      return {
        dateStr: `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit" })}`,
        value: val,
        pblh: rec.pblh_m,
        wind: rec.wind_speed_ms,
        event: rec.events && rec.events.length > 0 ? rec.events[0] : null,
      };
    });
  }, [historicalRecords, selectedPollutant]);

  const handleDownloadCsv = () => {
    const headers = "Date,StationId,City,PM2.5,PM10,NO2,SO2,CO,O3,AQI,PBLH_m,WindSpeed_ms,DocumentedEvents\n";
    const rows = historicalRecords.map((r) => `"${r.date}","${r.stationId}","${r.city}",${r.pm25},${r.pm10},${r.no2},${r.so2},${r.co},${r.o3},${r.aqi},${r.pblh_m},${r.wind_speed_ms},"${(r.events || []).join("; ")}"`).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `aeroward_historical_${selectedStationId}_${selectedDays}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-data-neutral font-semibold">Longitudinal Observation Archive</span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">Simulated demo dataset</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">Historical Trends &amp; Episodic Event Timeline</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">This archive is labeled as simulated and is not an official CPCB validated record.</p>
        </div>

        <button onClick={handleDownloadCsv} className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-elevated px-4 py-2 font-sans text-xs font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors">
          <FileSpreadsheet className="h-4 w-4 text-data-improvement" /> Download CSV Telemetry
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <select value={selectedStationId} onChange={(e) => handleStationChange(e.target.value)} className="rounded-sm border border-border bg-surface-elevated px-3 py-1.5 font-sans text-xs text-text-primary focus:border-accent focus:outline-none">
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-sans">
          <span className="text-text-muted mr-1">Time Horizon:</span>
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setSelectedDays(d)} className={`rounded-sm px-3 py-1 font-mono transition-colors ${selectedDays === d ? "border border-accent bg-surface-elevated text-accent font-bold" : "border border-border-subtle bg-surface hover:bg-surface-elevated text-text-secondary"}`} >{d} Days</button>
          ))}
        </div>

        <div className="inline-flex rounded-sm border border-border bg-surface-elevated p-1">
          {(["PM2.5", "PM10", "NO2", "AQI"] as const).map((pol) => (
            <button key={pol} onClick={() => setSelectedPollutant(pol)} className={`rounded-sm px-3 py-1 font-mono text-xs font-semibold transition-colors ${selectedPollutant === pol ? "bg-accent text-accent-foreground shadow-sm" : "text-text-secondary hover:text-text-primary"}`} >{pol}</button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-text-primary mb-3">Documented Meteorological Episodes in Time-Series</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center gap-2 text-danger"><Flame className="h-4 w-4" /><span className="font-sans text-xs font-bold uppercase tracking-wider">Stubble Burning Plume</span></div>
            <p className="mt-2 text-xs text-text-secondary font-sans leading-relaxed">Transboundary agricultural smoke advection. Spikes PM2.5 to 380+ µg/m³ with elevated CO and high UVAI absorbing aerosol indices.</p>
          </div>
          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center gap-2 text-data-improvement"><CloudRain className="h-4 w-4" /><span className="font-sans text-xs font-bold uppercase tracking-wider">Rain Washout Event</span></div>
            <p className="mt-2 text-xs text-text-secondary font-sans leading-relaxed">Western disturbance precipitation triggers rapid wet deposition scavenging, dropping PM2.5 by 78% down to 36 µg/m³ within 6 hours.</p>
          </div>
          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center gap-2 text-data-weather"><ThermometerSnowflake className="h-4 w-4" /><span className="font-sans text-xs font-bold uppercase tracking-wider">Nocturnal Inversion Trap</span></div>
            <p className="mt-2 text-xs text-text-secondary font-sans leading-relaxed">Winter radiational cooling compresses boundary layer to &lt;220m. Traps combustion exhaust overnight with slow daytime clearing.</p>
          </div>
          <div className="border border-border-subtle bg-surface p-4 rounded-sm">
            <div className="flex items-center gap-2 text-warning"><Wind className="h-4 w-4" /><span className="font-sans text-xs font-bold uppercase tracking-wider">Crustal Dust Storm</span></div>
            <p className="mt-2 text-xs text-text-secondary font-sans leading-relaxed">Pre-monsoon western squall lifts desert soil silt. Triggers extreme PM10 surge (600+ µg/m³) while combustion NO₂ drops due to dispersion.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-border bg-surface-elevated p-6 shadow-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle pb-4">
          <div>
            <div className="text-xs text-text-muted font-sans uppercase tracking-wider">Chronological Sensor Telemetry ({selectedDays}-Day Record)</div>
            <h2 className="mt-0.5 font-display text-xl font-bold text-text-primary">{selectedStation.name} &bull; {selectedPollutant} Time-Series</h2>
          </div>
        </div>

        <div className="mt-6 h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 35, left: 15, bottom: 5 }}>
              <defs>
                <linearGradient id="historyColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c76b45" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#c76b45" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#292d29" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#777c74" fontSize={11} tickLine={false} interval={selectedDays === 90 ? 36 : selectedDays === 30 ? 12 : selectedDays === 14 ? 6 : 2} tickFormatter={(val: string) => {
                const parts = val.split(" ");
                return `${parts[0]} ${parts[1] || ""}`;
              }} />
              <YAxis stroke="#777c74" fontSize={11} tickLine={false} unit=" µg/m³" />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-sm border border-border bg-surface-elevated p-3 shadow-lg text-xs font-sans">
                      <div className="font-bold text-text-primary">{data.dateStr}</div>
                      <div className="mt-1 font-mono text-accent font-bold">{selectedPollutant}: {data.value} µg/m³</div>
                      <div className="text-text-muted font-mono text-[11px] mt-0.5">Modeled PBLH: {data.pblh}m &bull; Wind: {data.wind} m/s</div>
                      {data.event && (<div className="mt-2 text-warning font-sans text-[11px] font-semibold border-t border-border-subtle pt-1.5">Episode: {data.event}</div>)}
                    </div>
                  );
                }
                return null;
              }} />
              <ReferenceLine y={60} stroke="#86a98a" strokeDasharray="4 4" label={{ value: "NAAQ Standard 60", fill: "#86a98a", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={250} stroke="#b95342" strokeDasharray="4 4" label={{ value: "Severe 250", fill: "#b95342", fontSize: 10, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="value" stroke="#c76b45" strokeWidth={2} fillOpacity={1} fill="url(#historyColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
