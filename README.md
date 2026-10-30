# AeroWard (aeroward)
## Predictive Air Quality Intelligence, Environmental Analysis & Proactive Pollution Mitigation

AeroWard is a complete, production-grade, interactive air-quality intelligence platform built upon the scientific foundation of the peer-reviewed research paper:

> **"Architectural Blueprint for Predictive Air Quality Intelligence: Modeling Paradigms, Citizen Exposure Mitigation, and Proactive Urban Ecosystem Regulation"**

---

## 1. System Vision: Five Core Questions Answered

AeroWard functions as a single unified environmental intelligence system addressing five essential questions:

1. **What is happening?**
   - Ground telemetry from Continuous Ambient Air Quality Monitoring Stations (CAAQMS) across Kanpur and the Indo-Gangetic Basin.
   - Satellite-derived column products (Copernicus Sentinel-5P TROPOMI UV Absorbing Aerosol Index & AOD).
2. **What is likely to happen next?**
   - Sub-second **12–72 hour multi-step forecasting** via Spatiotemporal Graph Neural Networks (A3T-GCN / ST-GCN).
   - A separately developed, transparently labeled **1–7 month seasonal statistical ensemble** with progressive uncertainty intervals.
3. **Why is it happening?**
   - Source apportionment distinguishing vehicular emissions (up to 78% of direct NOx flux in winter), secondary inorganic aerosols (SIA), crustal silt dust, and biomass stubble burning.
   - Atmospheric thermodynamics: nocturnal radiational cooling, thermal inversions, and horizontal wind stagnation (<1.5 m/s).
4. **Where could exposure become a concern?**
   - Micro-scale street canyon aerodynamics ($H/W \ge 1.0$, Build-to-Line Ratio $> 0.8$) inducing leeward aerodynamic vortices that double pedestrian sidewalk exposure.
5. **What can be done about it?**
   - **Predictive Graded Response Action Plan (GRAP)**: 12–36 hour advance dispatch of regenerative wet street sweeping, commercial freight bypass diversions, and industrial furnace batch rescheduling.
   - Smart Building Management Systems (BMS): +15 Pa positive pressurization 60 minutes before thermal inversion descent.
   - Exposure-aware routing minimizing personal inhalation dosage: $E = \sum C_i(\mathbf{x}, t) \cdot V_E(m) \cdot \delta t$.

---

## 2. Scientific Foundations & Kanpur / Indo-Gangetic Basin Research

All baseline metrics, chemical mass balances, and feedback dynamics are calibrated against published empirical research for Kanpur:

- **Seasonal PM2.5 Disparity**:
  - **Summer Mean**: $78 \pm 23\ \mu\text{g/m}^3$ (Dominated by crustal dust suspension, up to 28%).
  - **Winter Mean**: $238 \pm 96\ \mu\text{g/m}^3$ (Carbonaceous combustion $EC+OC$ and secondary inorganics constitute ~61% of particulate mass).
- **Aerosol-Radiation-Meteorology Feedback Mechanism**:
  - Light-absorbing black carbon aloft near 925 hPa scatters solar radiation back to space while heating the upper boundary layer, suppressing buoyant convective turbulence and depressing planetary boundary layer height (PBLH) by 200–400 meters.
  - Active self-sustaining loop threshold: $75\text{ to }100\ \mu\text{g/m}^3$.
  - Mitigation interrupts the cycle: restores $>50\text{m}$ daytime PBLH, preventing up to 40% of feedback-driven particulate mass.
- **Sentinel-5P TROPOMI UV Absorbing Aerosol Index (AAI)**:
  $$AAI = 100 \left[ \log_{10}\left(\frac{R_{\text{meas}}(380\text{nm})}{R_{\text{meas}}(340\text{nm})}\right) - \log_{10}\left(\frac{R_{\text{calc}}(380\text{nm})}{R_{\text{calc}}(340\text{nm})}\right) \right]$$
- **Agro-Ecosystem AOT40 Ozone Index & Wheat Yield Loss**:
  $$AOT40 = \sum \max(0, [\text{O}_3] - 40\text{ ppb}) \quad \text{for } G_{\text{rad}} > 50\text{ W/m}^2$$
  - Critical threshold: $3,000\text{ ppb}\cdot\text{h}$ during anthesis of winter wheat (*Triticum aestivum*).
  - Relative yield loss in India between **6.4% and 14.9%**.
- **Street Canyon Inhalation Dosage Formulation**:
  $$E = \sum_{i=1}^N C_i(\mathbf{x}, t) \cdot V_E(m) \cdot \delta t$$
  - Metabolic ventilation modes: Walking ($0.015\ \text{m}^3/\text{min}$), Cycling ($0.045\ \text{m}^3/\text{min}$), Driving ($0.010\ \text{m}^3/\text{min}$).
  - Windward sidewalks and vegetative screening reduce micro-exposure by **17% to 40%**.

---

## 3. Technology Stack: Zero-Python Node.js Backend

As strictly mandated, **Node.js and TypeScript power 100% of the backend runtime, APIs, data ingestion, and forecasting algorithms**.

### Backend
- **Runtime**: Node.js v24 + TypeScript (ESM)
- **Web Framework**: Fastify v4 + `@fastify/cors` + `@fastify/sensible`
- **Validation**: Zod (strict schema validation on all endpoints)
- **Database**: PostgreSQL with PostGIS extension (schema migration in `backend/src/db/migrations/001_initial_schema.sql`) + High-fidelity in-memory research repository fallback
- **Logging**: Pino structured logging
- **Testing**: Node.js native test runner (`node:test`) with automated API suite

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Design System**: Tailwind CSS v3 with centralized CSS custom properties in `app/globals.css` (semantic surfaces, borders, typography, and severity tokens)
- **Motion & Cinematic Effects**: **GSAP** (GreenSock) for the hero atmospheric physics canvas + Framer Motion
- **Geospatial Mapping**: **MapLibre GL JS**
- **Data Visualization**: Recharts + D3-inspired SVG components
- **Icons**: Lucide React

---

## 4. Application Routes

| Route | Name | Key Capabilities |
|---|---|---|
| `/` | Homepage | Atmospheric hero canvas with GSAP, interactive particle stream, 5 essential questions narrative, Kanpur case study highlights. |
| `/explore` | Air Quality Explorer | Interactive MapLibre GL map, multi-pollutant layers (AQI, PM2.5, PM10, NO2, SO2, CO, O3), wind vectors, satellite UVAI, street canyon inspector, timeline scrubber. |
| `/forecast` | Forecast Engine | Short-term 12h–72h GNN predictions & separate 1–7m seasonal ensemble, 95% uncertainty confidence ribbons, chronological MAE/RMSE disclosures. |
| `/causes` | Source Analysis | Chemical mass balance, Kanpur summer vs winter apportionment breakdown, boundary layer height, strict scientific causality vs feature importance disclaimer. |
| `/solutions` | Predictive GRAP | Proactive 12–36h advance dispatch window, afternoon vacuum street sweeping, freight diversions, building automation (BMS +15 Pa pressurization), citizen activity schedules. |
| `/routes` | Clean-Air Routing | Inhalation dosage optimization $E = \sum C_i \cdot V_E \cdot \delta t$, street canyon $H/W$ vortices, windward sidewalk navigation (38% dose reduction), MapLibre routing. |
| `/scenarios` | Scenario Laboratory | Interactive counterfactual sliders (freight diversion, wet dust suppression, industrial rescheduling, biomass bans), feedback loop disruption, wheat yield preservation. |
| `/history` | Historical Archive | Multi-year CAAQMS trends across Kanpur, Delhi, Lucknow, Varanasi, Patna; episodic event timeline; CSV download utility. |
| `/research` | Research & Methodology | Deep dive into the blueprint paper, Spatiotemporal GNN formulation, Sentinel-5P UVAI formula, AOT40 wheat loss equations, honest validation. |
| `/about` | Architecture & Provenance | Full-stack architecture, data provenance registry (CPCB, Copernicus, ECMWF, IITK), demonstration mode transparency, REST API catalog. |

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js $\ge$ 20.x (Recommended: v20.x or v24.x)
- npm $\ge$ 10.x

### Installation
```bash
# 1. Clone repository and install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
```

### Running Tests
Execute the automated test suite verifying all REST API endpoints, forecasting engines, dosage calculations, and zero-Python stack:
```bash
npm test
```

### Development Mode
Run both the Fastify backend (port 4000) and Next.js frontend (port 3000) concurrently:
```bash
npm run dev
```
Or start individually:
```bash
# Terminal 1 (Backend Fastify API)
npm run dev:backend

# Terminal 2 (Frontend Next.js)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Build both Next.js frontend and TypeScript backend
npm run build

# Start production services concurrently
npm start
```

---

## 6. REST API Endpoints

Fastify exposes the following validated REST endpoints under `/api/v1`:

- `GET  /api/v1/health` — System status, uptime, and architecture verification.
- `GET  /api/v1/stations` — List of CAAQMS monitoring stations in Kanpur & IGP basin.
- `GET  /api/v1/air-quality/current` — Real-time telemetry, NAQI, and boundary layer meteorology.
- `GET  /api/v1/air-quality/history` — Historical observations with episodic events.
- `GET  /api/v1/air-quality/map` — GeoJSON FeatureCollection formatted for MapLibre GL.
- `GET  /api/v1/forecasts` — 12h–72h short-term STGNN forecast with 95% uncertainty intervals.
- `GET  /api/v1/forecasts/seasonal` — 1–7-month seasonal climatological ensemble.
- `GET  /api/v1/analysis/sources` — Source apportionment receptor mass balance.
- `GET  /api/v1/analysis/weather` — Boundary layer dynamics, aerosol feedback loop, and AOT40 agro index.
- `GET  /api/v1/recommendations` — Predictive GRAP dispatch matrix and automated BMS commands.
- `POST /api/v1/routes/cleaner-air` — Inhalation dose route comparison across street canyons.
- `POST /api/v1/scenarios` — Counterfactual scenario simulation laboratory.
- `GET  /api/v1/metadata/data-sources` — Data provenance and instrumentation registry.
- `GET  /api/v1/metadata/model-performance` — Chronological out-of-sample validation metrics.

---

## 7. Scientific & Ethical Disclosures

1. **Short-Term vs Long-Range Forecasting**:
   - Short-term forecasts (12–72 hours) are supported by spatiotemporal deep learning paradigms.
   - Long-range projections (1–7 months) represent a separate seasonal statistical ensemble and are transparently labeled as experimental. They do not constitute deterministic guarantees.
2. **Feature Importance vs Physical Causality**:
   - Machine learning feature attribution (such as SHAP or tree weights) indicates predictive importance within the model, not demonstrated physical causation. Source apportionment values presented in AeroWard reflect formal chemical mass balance (CMB) and optical carbon speciation studies.
3. **Health Advice**:
   - Modeled exposure estimates and navigation recommendations are for informational planning and do not substitute for individual medical diagnosis or official municipal orders.
