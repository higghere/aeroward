// Google Maps API & Geospatial Location Geocoding Integration
// Connects to Google Maps Places API (New) & Geocoding Service with key: AIzaSyBO9KDwxmwwvtYTFkbswzQEi57uA-bZ69I
// with resilient regional Indo-Gangetic geodatabase fallback.

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  formattedAddress: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  source: "google_places" | "google_geocoding" | "regional_geocoder";
}

export const DEFAULT_GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBO9KDwxmwwvtYTFkbswzQEi57uA-bZ69I";

let isGoogleScriptLoading = false;
let googleScriptLoaded = false;

// Dynamically load Google Maps JavaScript API with Places and Geometry libraries
export function loadGoogleMapsScript(apiKey: string = DEFAULT_GOOGLE_MAPS_API_KEY): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).google?.maps) {
      googleScriptLoaded = true;
      resolve(true);
      return;
    }

    const key = apiKey || DEFAULT_GOOGLE_MAPS_API_KEY;
    if (!key) {
      resolve(false);
      return;
    }

    if (isGoogleScriptLoading) {
      const checkInterval = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      return;
    }

    isGoogleScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleScriptLoading = false;
      googleScriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      isGoogleScriptLoading = false;
      console.warn("[AeroWard] Google Maps script failed to load. Using proxy and regional geocoding.");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

// Curated regional geospatial database for Kanpur, UP, and Indo-Gangetic Basin locations
const REGIONAL_GEODATABASE: PlaceSuggestion[] = [
  // Kanpur Metropolitan Urban Airshed
  {
    placeId: "kanpur_ganga_barrage",
    name: "Ganga Barrage (Hydrological Boundary)",
    formattedAddress: "Ganga Barrage, Nawabganj, Kanpur, Uttar Pradesh 208002",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.5165,
    lng: 80.3012,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_bithoor",
    name: "Bithoor Historic Riverside Corridor",
    formattedAddress: "Bithoor, Kanpur Nagar, Uttar Pradesh 209201",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.6138,
    lng: 80.2745,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_civil_lines",
    name: "Civil Lines (District Administrative Hub)",
    formattedAddress: "Civil Lines, Kanpur, Uttar Pradesh 208001",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4852,
    lng: 80.3348,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_swaroop_nagar",
    name: "Swaroop Nagar Commercial & Hospital Zone",
    formattedAddress: "Swaroop Nagar, Kanpur, Uttar Pradesh 208002",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4812,
    lng: 80.3125,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_govind_nagar",
    name: "Govind Nagar High-Density Residential",
    formattedAddress: "Govind Nagar, Kanpur, Uttar Pradesh 208006",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4521,
    lng: 80.3115,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_chakeri",
    name: "Chakeri Industrial & Defense Corridor",
    formattedAddress: "Chakeri, Kanpur, Uttar Pradesh 208007",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4052,
    lng: 80.4125,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_armapur",
    name: "Armapur Estate (Ordnance Factory Corridor)",
    formattedAddress: "Armapur Estate, Kanpur, Uttar Pradesh 208009",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4785,
    lng: 80.2585,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_fazalganj",
    name: "Fazalganj Light Industrial Cluster",
    formattedAddress: "Fazalganj Industrial Estate, Kanpur, Uttar Pradesh 208012",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4632,
    lng: 80.3015,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_rawatpur",
    name: "Rawatpur Transit Junction (GT Road)",
    formattedAddress: "Rawatpur, Kanpur, Uttar Pradesh 208019",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4862,
    lng: 80.2854,
    source: "regional_geocoder",
  },
  {
    placeId: "kanpur_phool_bagh",
    name: "Phool Bagh / Bada Chauraha",
    formattedAddress: "Phool Bagh, Civil Lines, Kanpur, Uttar Pradesh 208001",
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4685,
    lng: 80.3552,
    source: "regional_geocoder",
  },

  // Lucknow Metropolitan Airshed
  {
    placeId: "lucknow_hazratganj",
    name: "Hazratganj Central Commercial Area",
    formattedAddress: "Hazratganj, Lucknow, Uttar Pradesh 226001",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8528,
    lng: 80.9462,
    source: "regional_geocoder",
  },
  {
    placeId: "lucknow_gomtinagar",
    name: "Gomti Nagar Institutional & Tech Corridor",
    formattedAddress: "Gomti Nagar, Lucknow, Uttar Pradesh 226010",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8585,
    lng: 80.9985,
    source: "regional_geocoder",
  },
  {
    placeId: "lucknow_charbagh",
    name: "Charbagh Railway Terminal Zone",
    formattedAddress: "Charbagh, Lucknow, Uttar Pradesh 226004",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8315,
    lng: 80.9215,
    source: "regional_geocoder",
  },

  // Delhi NCR Regional Airshed
  {
    placeId: "delhi_connaught_place",
    name: "Connaught Place (Inner Radial Corridor)",
    formattedAddress: "Connaught Place, New Delhi, Delhi 110001",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6315,
    lng: 77.2167,
    source: "regional_geocoder",
  },
  {
    placeId: "delhi_punjabi_bagh",
    name: "Punjabi Bagh Heavy Transit Corridor",
    formattedAddress: "Punjabi Bagh, New Delhi, Delhi 110026",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6712,
    lng: 77.1285,
    source: "regional_geocoder",
  },
  {
    placeId: "noida_sector_62",
    name: "Noida Sector 62 Institutional Zone",
    formattedAddress: "Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh 201309",
    city: "Noida",
    state: "Uttar Pradesh",
    lat: 28.6285,
    lng: 77.3685,
    source: "regional_geocoder",
  },
  {
    placeId: "gurugram_cyber_city",
    name: "Cyber City Arterial Corridor",
    formattedAddress: "DLF Cyber City, Gurugram, Haryana 122002",
    city: "Gurugram",
    state: "Haryana",
    lat: 28.4952,
    lng: 77.0895,
    source: "regional_geocoder",
  },

  // Varanasi Airshed
  {
    placeId: "varanasi_dashashwamedh",
    name: "Dashashwamedh Ghat River Corridor",
    formattedAddress: "Dashashwamedh Ghat, Varanasi, Uttar Pradesh 221001",
    city: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3075,
    lng: 83.0105,
    source: "regional_geocoder",
  },

  // Prayagraj & Agra
  {
    placeId: "prayagraj_sangam",
    name: "Triveni Sangam Hydrological Confluence",
    formattedAddress: "Sangam, Prayagraj, Uttar Pradesh 211005",
    city: "Prayagraj",
    state: "Uttar Pradesh",
    lat: 25.4295,
    lng: 81.8845,
    source: "regional_geocoder",
  },
  {
    placeId: "agra_taj_trapezium",
    name: "Taj Trapezium Environmental Zone (TTZ)",
    formattedAddress: "Tajganj, Agra, Uttar Pradesh 282001",
    city: "Agra",
    state: "Uttar Pradesh",
    lat: 27.1751,
    lng: 78.0421,
    source: "regional_geocoder",
  },
];

// Fetch Place Details from Google Places API or Proxy
export async function getGooglePlaceDetails(placeId: string, apiKey: string = DEFAULT_GOOGLE_MAPS_API_KEY): Promise<PlaceSuggestion | null> {
  const key = apiKey || DEFAULT_GOOGLE_MAPS_API_KEY;

  // 1. Try Backend Proxy
  try {
    const res = await fetch(`/api/v1/places/details?placeId=${encodeURIComponent(placeId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.lat && data.lng) {
        return {
          placeId: data.placeId,
          name: data.name,
          formattedAddress: data.formattedAddress,
          city: data.city || "Kanpur",
          state: data.state || "Uttar Pradesh",
          lat: data.lat,
          lng: data.lng,
          source: "google_places",
        };
      }
    }
  } catch (err) {
    // ignore
  }

  // 2. Direct Google Places API (New) call
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName,formattedAddress,location,addressComponents`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const cityComp = data.addressComponents?.find((c: any) =>
        c.types.includes("locality") || c.types.includes("administrative_area_level_2")
      );
      const stateComp = data.addressComponents?.find((c: any) =>
        c.types.includes("administrative_area_level_1")
      );
      return {
        placeId: data.id,
        name: data.displayName?.text || data.formattedAddress?.split(",")[0],
        formattedAddress: data.formattedAddress,
        lat: data.location?.latitude,
        lng: data.location?.longitude,
        city: cityComp ? cityComp.longText : "Kanpur",
        state: stateComp ? stateComp.longText : "Uttar Pradesh",
        source: "google_places",
      };
    }
  } catch (err) {
    // ignore
  }

  // 3. Check Regional Geodatabase
  const regional = REGIONAL_GEODATABASE.find((r) => r.placeId === placeId);
  return regional || null;
}

// Search locations using Google Places API (New) with key
export async function searchLocationsWithGoogle(
  query: string,
  apiKey: string = DEFAULT_GOOGLE_MAPS_API_KEY
): Promise<PlaceSuggestion[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const key = apiKey || DEFAULT_GOOGLE_MAPS_API_KEY;

  // 1. Try Backend Proxy
  try {
    const res = await fetch(`/api/v1/places/autocomplete?input=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        // Resolve details for the top results
        const detailed = await Promise.all(
          data.suggestions.slice(0, 5).map(async (s: any) => {
            const details = await getGooglePlaceDetails(s.placeId, key);
            if (details) return details;
            return {
              placeId: s.placeId,
              name: s.name,
              formattedAddress: s.formattedAddress,
              city: "Kanpur",
              state: "Uttar Pradesh",
              lat: 26.475,
              lng: 80.32,
              source: "google_places" as const,
            };
          })
        );
        return detailed;
      }
    }
  } catch (err) {
    // Continue to next tier
  }

  // 2. Direct Google Places API (New) call
  if (key) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
        },
        body: JSON.stringify({
          input: query.trim(),
          includedRegionCodes: ["in"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawSuggestions = data.suggestions || [];
        if (rawSuggestions.length > 0) {
          const detailed = await Promise.all(
            rawSuggestions.slice(0, 5).map(async (s: any) => {
              const pid = s.placePrediction?.placeId;
              const details = pid ? await getGooglePlaceDetails(pid, key) : null;
              if (details) return details;

              return {
                placeId: pid,
                name: s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text,
                formattedAddress: s.placePrediction?.text?.text,
                city: "Kanpur",
                state: "Uttar Pradesh",
                lat: 26.475,
                lng: 80.32,
                source: "google_places" as const,
              };
            })
          );
          return detailed;
        }
      }
    } catch (err) {
      console.warn("[AeroWard] Direct Google Places query notice:", err);
    }
  }

  // 3. Query Regional Geodatabase
  const matchedRegional = REGIONAL_GEODATABASE.filter(
    (item) =>
      item.name.toLowerCase().includes(cleanQuery) ||
      item.formattedAddress.toLowerCase().includes(cleanQuery) ||
      item.city.toLowerCase().includes(cleanQuery)
  );

  if (matchedRegional.length > 0) {
    return matchedRegional;
  }

  // 4. OpenStreetMap Nominatim Fallback
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
      { headers: { "User-Agent": "AeroWard-AirQuality-Intelligence/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          placeId: `osm_${d.place_id}`,
          name: d.name || d.display_name.split(",")[0],
          formattedAddress: d.display_name,
          city: d.address?.city || d.address?.town || d.address?.state_district || "Unknown",
          state: d.address?.state || "Uttar Pradesh",
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          source: "regional_geocoder" as const,
        }));
      }
    }
  } catch (err) {
    console.warn("[AeroWard] Geocoder fallback error:", err);
  }

  return [];
}
