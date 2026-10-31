"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Station, Observation } from "@/backend/src/repositories/dataStore";
import { getPollutionColor } from "@/lib/theme";
import {
  GANGA_RIVER_GEOJSON,
  MAJOR_CORRIDORS_GEOJSON,
  KANPUR_MUNICIPAL_BOUNDARY,
} from "@/lib/kanpurGeography";

interface AirQualityMapProps {
  stations: Station[];
  observations: Observation[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  activePollutant: "PM2.5" | "PM10" | "NO2" | "SO2" | "CO" | "O3" | "AQI" | "AQI (US)";
  showWindVectors: boolean;
  showSatelliteOverlay: boolean;
  showStreetCanyons: boolean;
}

const formatCoordinates = (lat: number, lng: number) => {
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lngStr}`;
};

export default function AirQualityMap({
  stations,
  observations,
  selectedStationId,
  onSelectStation,
  activePollutant,
  showWindVectors,
  showSatelliteOverlay,
  showStreetCanyons,
}: AirQualityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeCanyon, setActiveCanyon] = useState<{
    name: string;
    hwRatio: number;
    btr: number;
  } | null>(null);

  const activeTarget = stations.find((s) => s.id === selectedStationId) || stations[0];
  const activeObs = observations.find((o) => o.stationId === selectedStationId);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Production-grade, keyless Dark Canvas basemap with ground truth geography
    const darkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-dark-gray": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "&copy; Esri, HERE, Garmin, OpenStreetMap",
        },
        "esri-dark-reference": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "esri-dark-base-layer",
          type: "raster",
          source: "esri-dark-gray",
          minzoom: 0,
          maxzoom: 18,
        },
        {
          id: "esri-dark-reference-layer",
          type: "raster",
          source: "esri-dark-reference",
          minzoom: 0,
          maxzoom: 18,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: darkStyle,
      center: activeTarget ? [activeTarget.lng, activeTarget.lat] : [80.315, 26.475],
      zoom: 11.8,
      pitch: 32,
      bearing: -10,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
      "top-right"
    );

    map.on("load", () => {
      // 1. Add River Ganga contour polygon
      map.addSource("ganga-river", {
        type: "geojson",
        data: GANGA_RIVER_GEOJSON,
      });

      map.addLayer({
        id: "ganga-river-fill",
        type: "fill",
        source: "ganga-river",
        paint: {
          "fill-color": "#2c4856",
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: "ganga-river-outline",
        type: "line",
        source: "ganga-river",
        paint: {
          "line-color": "#4a7a8c",
          "line-width": 1.5,
          "line-opacity": 0.7,
        },
      });

      // 2. Add Municipal Boundary
      map.addSource("kanpur-boundary", {
        type: "geojson",
        data: KANPUR_MUNICIPAL_BOUNDARY,
      });

      map.addLayer({
        id: "kanpur-boundary-line",
        type: "line",
        source: "kanpur-boundary",
        paint: {
          "line-color": "#636862",
          "line-width": 1,
          "line-dasharray": [3, 2],
          "line-opacity": 0.5,
        },
      });

      // 3. Add Major Arterial Corridors
      map.addSource("major-corridors", {
        type: "geojson",
        data: MAJOR_CORRIDORS_GEOJSON,
      });

      map.addLayer({
        id: "major-corridors-lines",
        type: "line",
        source: "major-corridors",
        paint: {
          "line-color": [
            "match",
            ["get", "corridorType"],
            "highway",
            "#a8583b",
            "arterial",
            "#5e6e61",
            "#444b44",
          ],
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers when stations, observations, or pollutant changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear removed markers
    const currentStationIds = new Set(stations.map((s) => s.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentStationIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    stations.forEach((station) => {
      const obs = observations.find((o) => o.stationId === station.id);
      let value: number | null = null;

      if (obs) {
        if (activePollutant === "AQI (US)") {
          value = obs.us_aqi ?? null;
        } else if (activePollutant === "AQI") {
          value = obs.aqi;
        } else if (activePollutant === "PM2.5") {
          value = obs.pm25;
        } else if (activePollutant === "PM10") {
          value = obs.pm10;
        } else if (activePollutant === "NO2") {
          value = obs.no2;
        } else if (activePollutant === "SO2") {
          value = obs.so2;
        } else if (activePollutant === "CO") {
          value = obs.co;
        } else if (activePollutant === "O3") {
          value = obs.o3;
        }
      }

      const color = value !== null ? getPollutionColor(value, activePollutant) : "#a4a79f";
      const isSelected = station.id === selectedStationId;

      let marker = markersRef.current[station.id];

      if (!marker) {
        const el = document.createElement("div");
        el.className = "station-marker cursor-pointer";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.transition = "transform 0.15s ease-out";

        el.onclick = () => {
          onSelectStation(station.id);
        };

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([station.lng, station.lat])
          .addTo(map);

        markersRef.current[station.id] = marker;
      }

      // Update marker DOM
      const el = marker.getElement();
      el.innerHTML = `
        <div style="
          background-color: ${color}20;
          border: 2px solid ${color};
          color: ${color};
          width: ${isSelected ? "34px" : "28px"};
          height: ${isSelected ? "34px" : "28px"};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-weight: 700;
          font-size: ${isSelected ? "12px" : "11px"};
          box-shadow: 0 0 ${isSelected ? "14px" : "6px"} ${color}60;
          backdrop-filter: blur(4px);
        ">
          ${value !== null ? value : "--"}
        </div>
        <div style="
          background: rgba(18, 20, 18, 0.85);
          color: #eeeee8;
          font-size: 10px;
          font-family: sans-serif;
          padding: 1px 4px;
          border-radius: 2px;
          margin-top: 3px;
          white-space: nowrap;
          border: 1px solid #333a33;
          display: ${isSelected ? "block" : "none"};
        ">
          ${station.name.split(" ")[0]}
        </div>
      `;
    });

    // Fly to selected station if changed
    const target = stations.find((s) => s.id === selectedStationId);
    if (target) {
      const isKanpurAirshed =
        target.lat >= 26.2 && target.lat <= 26.7 && target.lng >= 80.0 && target.lng <= 80.6;
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: isKanpurAirshed ? 12 : 10.5,
        duration: 1400,
        essential: true,
      });
    }
  }, [stations, observations, selectedStationId, activePollutant, onSelectStation, mapLoaded]);

  // Derived meteorological display details from real observation
  const tempStr = activeObs?.meteorology?.temp_c != null ? `${activeObs.meteorology.temp_c}°C` : null;
  const rhStr = activeObs?.meteorology?.rh_pct != null ? `${activeObs.meteorology.rh_pct}% RH` : null;
  const windStr =
    activeObs?.meteorology?.wind_speed_ms != null
      ? `${(activeObs.meteorology.wind_speed_ms * 3.6).toFixed(0)} km/h`
      : null;
  const metDetails = [tempStr, rhStr, windStr].filter(Boolean).join(" • ");

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-border">
      <div ref={mapContainerRef} className="h-full w-full min-h-[500px]" />

      {/* Atmospheric Conditions Notice */}
      {showWindVectors && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-sm border border-border bg-surface/90 px-3 py-1.5 text-xs text-text-primary backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${activeTarget ? "bg-data-improvement animate-pulse" : "bg-data-weather animate-ping"}`} />
          <span className="font-sans font-medium text-text-secondary">
            Atmospheric Conditions:{" "}
            <span className="font-mono text-text-primary font-semibold">
              {metDetails || "Telemetry active"}
            </span>
          </span>
        </div>
      )}

      {/* Satellite UVAI Overlay Notice */}
      {showSatelliteOverlay && (
        <div className="absolute top-14 left-4 z-10 flex items-center gap-2 rounded-sm border border-border bg-surface/90 px-3 py-1.5 text-xs text-accent backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-sans font-medium text-text-secondary">
            Sentinel-5P TROPOMI UVAI:{" "}
            <span className="font-mono text-accent font-semibold">
              {activeObs?.satellite?.tropomi_aai != null ? `+${activeObs.satellite.tropomi_aai}` : "N/A"}
            </span>
            <span className="ml-1 text-[11px] text-text-muted">Aerosol Index</span>
          </span>
        </div>
      )}

      {/* Street Canyon & Geographic Legend */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-sm border border-border bg-surface/95 p-3 text-xs text-text-secondary backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
          <span className="font-sans font-semibold text-text-primary">
            Airshed Geography
          </span>
          <span className="font-mono text-[10px] text-accent font-semibold">
            {activeTarget?.city || "Airshed"}
          </span>
        </div>
        {activeTarget &&
        (activeTarget.lat < 26.2 || activeTarget.lat > 26.7 || activeTarget.lng < 80.0 || activeTarget.lng > 80.6) ? (
          <div className="mt-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium truncate max-w-[200px]">{activeTarget.name}</span>
              <span className="font-mono text-accent">{activeTarget.city}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Geographic Coordinates</span>
              <span className="font-mono text-text-primary">
                {formatCoordinates(activeTarget.lat, activeTarget.lng)}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Regional Airshed Domain</span>
              <span className="font-mono text-data-weather">
                {activeTarget.city === "Shillong"
                  ? "Highland Clean Air Shed"
                  : activeTarget.city === "Mumbai"
                  ? "Coastal Marine Boundary Layer"
                  : activeTarget.city === "Agra"
                  ? "Yamuna Basin / TTZ Eco-Zone"
                  : `${activeTarget.state} Air Quality Basin`}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[#4a7a8c] inline-block" />
                River Ganga (Northern Hydrologic Boundary)
              </span>
              <span className="font-mono text-text-muted">Waterway</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[#c76b45] inline-block" />
                Grand Trunk Road (NH 91/19) Corridor
              </span>
              <span className="font-mono text-accent">H/W 1.42</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[#82b8c5] inline-block" />
                Civil Lines &amp; Mall Road Institutional
              </span>
              <span className="font-mono text-data-weather">H/W 0.65</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 border-b border-dashed border-border-strong inline-block" />
                Kanpur Municipal Corporation Boundary
              </span>
              <span className="font-mono text-text-muted">KMC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
