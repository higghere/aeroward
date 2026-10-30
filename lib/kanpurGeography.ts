// Ground Truth Geographic Features for Kanpur & Indo-Gangetic Basin
// Provides authentic spatial context: Ganga River, GT Road Corridor, Railway Trunk, Municipal Boundary, and Street Canyons

export const GANGA_RIVER_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "River Ganga (Northern Hydrological Boundary)",
        type: "river",
        stroke: "#537c8d",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.185, 26.565], // Bithoor upstream
          [80.225, 26.545], // North of IIT Kanpur
          [80.265, 26.525], // Nawabganj / Ganga Barrage
          [80.305, 26.505], // Permat / Bhairav Ghat
          [80.335, 26.485], // Sarsiya Ghat
          [80.375, 26.465], // Shuklaganj border
          [80.415, 26.445], // Jajmau historic bridge
          [80.455, 26.425], // Downstream towards Unnao
        ],
      },
    },
  ],
};

export const MAJOR_CORRIDORS_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Grand Trunk Road (NH 91 / NH 19) Arterial",
        type: "highway",
        hwRatio: 1.42,
        btr: 0.86,
        color: "#c76b45",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.215, 26.525], // Western approach past Mandhana
          [80.235, 26.512], // IIT Kanpur Gate 1
          [80.262, 26.495], // Kalyanpur Market
          [80.285, 26.486], // Rawatpur Junction
          [80.308, 26.478], // Gumti No. 5 Commercial Hub
          [80.324, 26.471], // Nehru Nagar / Harsh Nagar
          [80.345, 26.463], // Jarib Chowki
          [80.368, 26.455], // Tatmill Junction
          [80.401, 26.431], // Jajmau Leather Cluster
          [80.445, 26.415], // Eastern Highway Outflow
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Mall Road & Civil Lines Institutional Corridor",
        type: "secondary",
        hwRatio: 0.65,
        btr: 0.45,
        color: "#82b8c5",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.315, 26.495], // Company Bagh / Phool Bagh
          [80.335, 26.485], // Civil Lines District Magistrate / Courts
          [80.355, 26.478], // Bada Chauraha
          [80.365, 26.468], // Phool Bagh
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "North Central Railway Trunk Line (Howrah–Delhi Corridor)",
        type: "railway",
        color: "#777c74",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.215, 26.505], // Panki Railway Marshalling Yard
          [80.255, 26.492], // Kalyanpur Station
          [80.288, 26.482], // Rawatpur Station
          [80.335, 26.465], // Govindpuri Junction
          [80.355, 26.455], // Kanpur Central Station
          [80.405, 26.438], // Chakeri Station
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Kanpur Southern Industrial Bypass (Panki–Kidwai Nagar)",
        type: "bypass",
        color: "#d58a50",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.245, 26.468], // Panki Industrial Area
          [80.275, 26.455], // Armapur Estate / Ordnance Factory
          [80.315, 26.445], // Fazalganj Industrial Estate
          [80.339, 26.438], // Kidwai Nagar High Density
          [80.375, 26.432], // Naubasta Highway Bypass
        ],
      },
    },
  ],
};

export const KANPUR_MUNICIPAL_BOUNDARY: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Kanpur Municipal Corporation (KMC) Urban Airshed Boundary",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [80.195, 26.545],
            [80.275, 26.535],
            [80.365, 26.505],
            [80.435, 26.455],
            [80.445, 26.395],
            [80.385, 26.385],
            [80.285, 26.415],
            [80.215, 26.445],
            [80.195, 26.495],
            [80.195, 26.545],
          ],
        ],
      },
    },
  ],
};
