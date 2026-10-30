"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { RouteOption, RouteSegment } from "@/backend/src/geospatial/routingEngine";
import {
  GANGA_RIVER_GEOJSON,
  MAJOR_CORRIDORS_GEOJSON,
  KANPUR_MUNICIPAL_BOUNDARY,
} from "@/lib/kanpurGeography";

interface RouteMapProps {
  routes: RouteOption[];
  activeRouteId: "clean_air" | "balanced" | "shortest_distance";
  onSelectRoute: (id: "clean_air" | "balanced" | "shortest_distance") => void;
  selectedSegmentId?: string | null;
  onSelectSegment?: (segment: RouteSegment | null) => void;
}

export default function RouteMap({
  routes,
  activeRouteId,
  onSelectRoute,
  selectedSegmentId,
  onSelectSegment,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Production-grade keyless dark basemap
    const darkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-dark-gray": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "&copy; Esri, HERE, OpenStreetMap",
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
      center: [80.28, 26.49],
      zoom: 12.2,
      pitch: 30,
      bearing: -8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // 1. Municipal Boundary
      map.addSource("kanpur-boundary-src", {
        type: "geojson",
        data: KANPUR_MUNICIPAL_BOUNDARY,
      });
      map.addLayer({
        id: "kanpur-boundary-line",
        type: "line",
        source: "kanpur-boundary-src",
        paint: {
          "line-color": "#343832",
          "line-width": 1.2,
          "line-dasharray": [4, 4],
        },
      });

      // 2. Ganga River Hydrological Spine
      map.addSource("ganga-river-src", {
        type: "geojson",
        data: GANGA_RIVER_GEOJSON,
      });
      map.addLayer({
        id: "ganga-river-line",
        type: "line",
        source: "ganga-river-src",
        paint: {
          "line-color": "#4a7a8c",
          "line-width": 5,
          "line-opacity": 0.65,
        },
      });

      // 3. Ground Truth Corridors
      map.addSource("major-corridors-src", {
        type: "geojson",
        data: MAJOR_CORRIDORS_GEOJSON,
      });
      map.addLayer({
        id: "major-corridors-line",
        type: "line",
        source: "major-corridors-src",
        paint: {
          "line-color": "#292d29",
          "line-width": 2,
        },
      });

      // 4. Add Synthesized Routes
      renderRouteLines(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  const renderRouteLines = (map: maplibregl.Map) => {
    // Clean old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove existing route layers/sources if any
    ["clean_air", "balanced", "shortest_distance"].forEach((rid) => {
      if (map.getLayer(`route-casing-${rid}`)) map.removeLayer(`route-casing-${rid}`);
      if (map.getLayer(`route-layer-${rid}`)) map.removeLayer(`route-layer-${rid}`);
      if (map.getSource(`route-source-${rid}`)) map.removeSource(`route-source-${rid}`);
    });

    if (!routes || routes.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    routes.forEach((route) => {
      const sourceId = `route-source-${route.routeId}`;
      const casingId = `route-casing-${route.routeId}`;
      const layerId = `route-layer-${route.routeId}`;

      route.coordinates.forEach((coord) => bounds.extend(coord));

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.coordinates,
          },
          properties: {
            routeId: route.routeId,
            title: route.title,
          },
        },
      });

      const isClean = route.routeId === "clean_air";
      const isShortest = route.routeId === "shortest_distance";
      const color = isClean ? "#86a98a" : isShortest ? "#b95342" : "#c2b06c";

      // Outer casing for contrast
      map.addLayer({
        id: casingId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#101110",
          "line-width": route.routeId === activeRouteId ? 8 : 4.5,
          "line-opacity": 0.85,
        },
      });

      // Core route line
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": route.routeId === activeRouteId ? 5 : 2.5,
          "line-opacity": route.routeId === activeRouteId ? 1.0 : 0.45,
        },
      });

      map.on("click", layerId, () => {
        onSelectRoute(route.routeId);
      });
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Add Origin Marker
    const activeRoute = routes.find((r) => r.routeId === activeRouteId) || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      const originCoord = activeRoute.coordinates[0];
      const destCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];

      // Origin Marker Element
      const originEl = document.createElement("div");
      originEl.className = "flex items-center justify-center";
      originEl.innerHTML = `
        <div style="background: #82b8c5; box-shadow: 0 0 12px #82b8c599;"
             class="h-6 w-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-mono font-bold text-surface">
          A
        </div>
      `;
      const originMarker = new maplibregl.Marker({ element: originEl })
        .setLngLat(originCoord)
        .addTo(map);
      markersRef.current.push(originMarker);

      // Destination Marker Element
      const destEl = document.createElement("div");
      destEl.className = "flex items-center justify-center";
      destEl.innerHTML = `
        <div style="background: #c76b45; box-shadow: 0 0 12px #c76b4599;"
             class="h-6 w-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-mono font-bold text-text-primary">
          B
        </div>
      `;
      const destMarker = new maplibregl.Marker({ element: destEl })
        .setLngLat(destCoord)
        .addTo(map);
      markersRef.current.push(destMarker);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 13.5 });
    }
  };

  // Re-render when routes or activeRouteId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    routes.forEach((route) => {
      const layerId = `route-layer-${route.routeId}`;
      const casingId = `route-casing-${route.routeId}`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(
          layerId,
          "line-width",
          route.routeId === activeRouteId ? 5.5 : 2.5
        );
        map.setPaintProperty(
          layerId,
          "line-opacity",
          route.routeId === activeRouteId ? 1.0 : 0.4
        );
      }
      if (map.getLayer(casingId)) {
        map.setPaintProperty(
          casingId,
          "line-width",
          route.routeId === activeRouteId ? 8.5 : 4
        );
      }
    });
  }, [routes, activeRouteId]);

  // Handle OD pair change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    renderRouteLines(map);
  }, [routes]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-border">
      <div ref={mapContainerRef} className="h-full w-full min-h-[460px]" />

      {/* Route Mode Legend & Inhaled Dose Formula */}
      <div className="absolute top-4 left-4 z-10 max-w-sm rounded-sm border border-border bg-surface/95 p-3 text-xs text-text-secondary backdrop-blur-md">
        <div className="font-sans font-semibold text-text-primary">
          Inhaled Dosage Differential
        </div>
        <div className="mt-1 font-mono text-[11px] text-accent">
          E = Σ C_i(x,t) · V_E(m) · Δt
        </div>
        <p className="mt-1 text-[11px] text-text-muted leading-relaxed">
          Windward sidewalks and park buffers reduce microscale particulate inhalation by up to 38%
          compared to trapped leeward vortex canyons (H/W ≥ 1.0).
        </p>
      </div>
    </div>
  );
}
