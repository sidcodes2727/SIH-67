CREATE TABLE IF NOT EXISTS heavy_metal_data (
  id SERIAL PRIMARY KEY,
  metal_type VARCHAR(10) NOT NULL,
  concentration NUMERIC NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  hmpi NUMERIC,
  category VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_hmd_loc_time ON heavy_metal_data(latitude, longitude, timestamp);
