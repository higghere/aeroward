-- AeroWard Database Schema (PostgreSQL + PostGIS)
-- Migration 001: Initial Environmental Intelligence Schema

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Monitoring Stations (Ground CAAQMS & Micro-sensors)
CREATE TABLE IF NOT EXISTS monitoring_stations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    elevation_m NUMERIC(6, 2),
    station_type VARCHAR(50) NOT NULL DEFAULT 'CAAQMS', -- CAAQMS, Research_SuperSite, Micro_Sensor
    operator VARCHAR(100) NOT NULL DEFAULT 'CPCB / UPPCB',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_city ON monitoring_stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_location ON monitoring_stations USING GIST(location);

-- 2. Air Quality Observations (Telemetry)
CREATE TABLE IF NOT EXISTS air_quality_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(64) NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    pm25 NUMERIC(6, 2),
    pm10 NUMERIC(6, 2),
    no2 NUMERIC(6, 2),
    so2 NUMERIC(6, 2),
    co NUMERIC(6, 2),
    o3 NUMERIC(6, 2),
    aqi INTEGER,
    dominant_pollutant VARCHAR(20),
    data_quality VARCHAR(30) DEFAULT 'validated', -- validated, raw, flagged, synthetic
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_station_time ON air_quality_observations(station_id, recorded_at DESC);

-- 3. Spaceborne Earth Observation (Sentinel-5P TROPOMI & MODIS/VIIRS)
CREATE TABLE IF NOT EXISTS satellite_observations (
    id BIGSERIAL PRIMARY KEY,
    latitude NUMERIC(8, 4) NOT NULL,
    longitude NUMERIC(8, 4) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    satellite_mission VARCHAR(50) NOT NULL DEFAULT 'Sentinel-5P',
    instrument VARCHAR(50) NOT NULL DEFAULT 'TROPOMI',
    absorbing_aerosol_index NUMERIC(5, 3), -- Sentinel-5P UVAI / AAI (340/380 nm)
    aerosol_optical_depth NUMERIC(5, 3),   -- 550 nm AOD
    tropomi_no2_column NUMERIC(10, 4),     -- mol/m^2
    tropomi_so2_column NUMERIC(10, 4),
    tropomi_co_column NUMERIC(10, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_time ON satellite_observations(recorded_at DESC);

-- 4. Meteorological & Boundary Layer Dynamics
CREATE TABLE IF NOT EXISTS meteorological_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(64) NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(5, 2),
    relative_humidity_pct NUMERIC(5, 2),
    wind_speed_ms NUMERIC(5, 2),
    wind_direction_deg NUMERIC(5, 2),
    planetary_boundary_layer_height_m NUMERIC(7, 2), -- PBLH in meters
    surface_inversion_strength NUMERIC(5, 2),        -- deg C / 100m
    solar_radiation_wm2 NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_met_station_time ON meteorological_observations(station_id, recorded_at DESC);

-- 5. Model Forecasts (Multi-Step & Long-Range)
CREATE TABLE IF NOT EXISTS forecast_records (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(64) NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    pollutant VARCHAR(20) NOT NULL,
    horizon VARCHAR(20) NOT NULL, -- 12h, 24h, 48h, 72h, 1m, 2m, 3m, 4m, 5m, 6m, 7m
    model_architecture VARCHAR(100) NOT NULL, -- A3T-GCN, ST-GCN, Seasonal_Ensemble
    model_version VARCHAR(30) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    target_time TIMESTAMPTZ NOT NULL,
    predicted_value NUMERIC(6, 2) NOT NULL,
    lower_bound_95 NUMERIC(6, 2),
    upper_bound_95 NUMERIC(6, 2),
    validation_status VARCHAR(30) NOT NULL DEFAULT 'validated'
);

CREATE INDEX IF NOT EXISTS idx_forecast_station_horizon ON forecast_records(station_id, horizon, target_time);

-- 6. Model Evaluation Logs
CREATE TABLE IF NOT EXISTS model_evaluations (
    id BIGSERIAL PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    horizon VARCHAR(20) NOT NULL,
    pollutant VARCHAR(20) NOT NULL,
    mae NUMERIC(6, 2) NOT NULL,
    rmse NUMERIC(6, 2) NOT NULL,
    bias NUMERIC(6, 2) NOT NULL,
    skill_score_persistence NUMERIC(5, 3),
    picp_95 NUMERIC(5, 2),
    sample_count INTEGER NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Data Source Ingestion Registry
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    dataset_name VARCHAR(150) NOT NULL,
    update_frequency VARCHAR(50) NOT NULL,
    last_successful_ingestion TIMESTAMPTZ,
    records_count INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'operational',
    license_info VARCHAR(255)
);
