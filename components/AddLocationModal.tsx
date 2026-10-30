"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  MapPin, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Key, 
  Layers, 
  Activity, 
  Compass,
  Building2,
  Wind
} from "lucide-react";
import { Station } from "@/backend/src/repositories/dataStore";
import { 
  searchLocationsWithGoogle, 
  loadGoogleMapsScript, 
  PlaceSuggestion,
  DEFAULT_GOOGLE_MAPS_API_KEY,
  geocodeLocation
} from "@/lib/googleMaps";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStation: (station: Station) => void;
}

export default function AddLocationModal({
  isOpen,
  onClose,
  onAddStation,
}: AddLocationModalProps) {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_GOOGLE_MAPS_API_KEY);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [elevation, setElevation] = useState<number>(126);
  const [stationType, setStationType] = useState<"CAAQMS" | "Research_SuperSite" | "Micro_Sensor">("CAAQMS");
  const [operator, setOperator] = useState("AeroWard / State PCB");
  const [siltLoading, setSiltLoading] = useState<number>(4.8);
  const [canyonHwRatio, setCanyonHwRatio] = useState<number>(1.15);
  const [canyonBtr, setCanyonBtr] = useState<number>(0.75);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load API key from env or localStorage
  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const storedKey = typeof window !== "undefined" ? localStorage.getItem("aeroward_google_maps_key") || "" : "";
    const activeKey = storedKey || envKey;
    if (activeKey) {
      setApiKey(activeKey);
      loadGoogleMapsScript(activeKey).then((loaded) => {
        setIsGoogleLoaded(loaded);
      });
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("aeroward_google_maps_key", apiKey.trim());
      loadGoogleMapsScript(apiKey.trim()).then((loaded) => {
        setIsGoogleLoaded(loaded);
        setShowKeyInput(false);
      });
    }
  };

  // Perform search as user types
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchLocationsWithGoogle(searchQuery, apiKey);
      setSuggestions(results);
      setIsSearching(false);
    }, 280);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, apiKey]);

  const handleSelectSuggestion = (sug: PlaceSuggestion) => {
    const resolvedName = sug.name || sug.formattedAddress?.split(",")[0] || "Custom Monitoring Station";
    const resolvedCity = sug.city || sug.formattedAddress?.split(",")[0] || "Regional Station";
    setName(resolvedName);
    setCity(resolvedCity);
    setState(sug.state || "India");
    setLat(Number(sug.lat.toFixed(5)));
    setLng(Number(sug.lng.toFixed(5)));
    setSuggestions([]);
    setSearchQuery(sug.formattedAddress || sug.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    const queryTarget = searchQuery.trim() || name.trim() || city.trim();
    let geo: PlaceSuggestion | null = null;
    if (queryTarget) {
      geo = await geocodeLocation(queryTarget, apiKey);
    }

    const finalLat =
      lat !== "" && Number(lat) !== 26.475
        ? Number(lat)
        : geo?.lat ?? 27.1767;
    const finalLng =
      lng !== "" && Number(lng) !== 80.32
        ? Number(lng)
        : geo?.lng ?? 78.0081;
    const finalCity =
      city.trim() && city.trim() !== "Kanpur"
        ? city.trim()
        : geo?.city || queryTarget.split(",")[0].trim() || "Regional Station";
    const finalState = state.trim() || geo?.state || "India";
    const finalName =
      name.trim() ||
      geo?.name ||
      queryTarget ||
      `${finalCity} Air Quality Station`;

    const newStation: Station = {
      id: `station_${finalCity.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`,
      name: finalName,
      city: finalCity,
      state: finalState,
      lat: Number(finalLat.toFixed(5)),
      lng: Number(finalLng.toFixed(5)),
      elevation_m: Number(elevation) || 125,
      station_type: stationType,
      operator: operator.trim() || "AeroWard Network Monitor",
      status: "active",
      silt_loading_gm2: Number(siltLoading) || 4.5,
      canyon_hw_ratio: Number(canyonHwRatio) || 1.1,
      canyon_btr: Number(canyonBtr) || 0.7,
    };

    setIsSearching(false);
    onAddStation(newStation);
    setName("");
    setCity("");
    setState("");
    setLat("");
    setLng("");
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-sm border border-border bg-surface-elevated p-6 shadow-elevation text-xs font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent/20 text-accent border border-accent/40">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">
                Add Monitoring Location to AeroWard Network
              </h2>
              <p className="text-text-secondary text-[11px]">
                Powered by Google Maps Places Autocomplete &amp; Indo-Gangetic Geospatial Index
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Google Maps API Connection Status Banner */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-sm border border-border-subtle bg-surface p-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isGoogleLoaded ? "bg-data-improvement animate-pulse" : "bg-warning"
              }`}
            />
            <span className="font-medium text-text-primary">
              {isGoogleLoaded
                ? "Google Maps Places API Active"
                : "AeroWard Regional Geocoder Active (Google Maps Optional)"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
          >
            <Key className="h-3 w-3" /> {isGoogleLoaded ? "Change API Key" : "Add Google Maps API Key"}
          </button>
        </div>

        {/* Optional Google Maps API Key Input Box */}
        {showKeyInput && (
          <div className="mt-2 rounded-sm border border-accent/40 bg-surface p-3 space-y-2">
            <label className="text-[11px] font-medium text-text-secondary block">
              Enter Google Maps JavaScript &amp; Places API Key:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 rounded-sm border border-border bg-surface-elevated px-2.5 py-1.5 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="rounded-sm bg-accent px-3 py-1.5 font-semibold text-accent-foreground hover:bg-accent-hover transition-colors"
              >
                Connect Key
              </button>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              If an API key is connected, global addresses and live Google Places autocompletion will stream directly. Without an API key, the built-in Indo-Gangetic geodatabase and open geocoding engine will resolve addresses.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Autocomplete Search Bar */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1">
              Search Location (Google Places Autocomplete)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type any address, city, landmark (e.g. Ganga Barrage, Hazratganj, Connaught Place)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 pl-9 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none shadow-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              {isSearching && (
                <Activity className="absolute right-3 top-3 h-4 w-4 animate-spin text-accent" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-sm border border-border-strong bg-surface-elevated shadow-lg divide-y divide-border-subtle">
                {suggestions.map((sug) => (
                  <button
                    key={sug.placeId}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="flex w-full items-start gap-2.5 p-2.5 text-left transition-colors hover:bg-surface"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                    <div className="truncate">
                      <div className="font-semibold text-text-primary text-xs">{sug.name}</div>
                      <div className="text-[11px] text-text-muted truncate">{sug.formattedAddress}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-4">
            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Station / Location Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ganga Barrage Wetland Station"
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                City / District *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kanpur"
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Latitude (°N) *
              </label>
              <input
                type="number"
                step="0.00001"
                required
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Longitude (°E) *
              </label>
              <input
                type="number"
                step="0.00001"
                required
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Station Monitoring Classification
              </label>
              <select
                value={stationType}
                onChange={(e) => setStationType(e.target.value as any)}
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="CAAQMS">Continuous Regulatory Station (CAAQMS)</option>
                <option value="Research_SuperSite">Aerosol Research SuperSite</option>
                <option value="Micro_Sensor">Micro-Sensor / Hyperlocal Node</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Operating Authority
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="e.g. UPPCB / CPCB or IIT Kanpur"
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Aerodynamic Microclimate Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-4">
            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Street Canyon Aspect Ratio (H/W)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="3.0"
                  value={canyonHwRatio}
                  onChange={(e) => setCanyonHwRatio(parseFloat(e.target.value))}
                  className="w-24 rounded-sm border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                />
                <span className="text-[11px] text-text-muted">
                  {canyonHwRatio >= 1.0 ? "Deep Canyon (Vortex Trap)" : "Open Corridor (High Dispersion)"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Road Silt Loading (g/m²)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="15.0"
                  value={siltLoading}
                  onChange={(e) => setSiltLoading(parseFloat(e.target.value))}
                  className="w-24 rounded-sm border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                />
                <span className="text-[11px] text-text-muted">
                  {siltLoading > 2.0 ? "Wet Sweeper Trigger Active (>2.0)" : "Low Silt Baseline"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-border bg-surface px-4 py-2 font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2 font-semibold text-accent-foreground hover:bg-accent-hover transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Add Station to Network
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
