-- Drop old table if exists
DROP TABLE IF EXISTS heavy_metal_data;

-- Create new table with mineral concentrations as columns
CREATE TABLE heavy_metal_data (
  id SERIAL PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  pb NUMERIC NOT NULL DEFAULT 0,  -- Lead concentration
  cd NUMERIC NOT NULL DEFAULT 0,  -- Cadmium concentration  
  as_metal NUMERIC NOT NULL DEFAULT 0,  -- Arsenic concentration (as is reserved keyword)
  hg NUMERIC NOT NULL DEFAULT 0,  -- Mercury concentration
  cr NUMERIC NOT NULL DEFAULT 0,  -- Chromium concentration
  hmpi NUMERIC,
  category VARCHAR(20),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_hmd_location ON heavy_metal_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hmd_timestamp ON heavy_metal_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_hmd_loc_time ON heavy_metal_data(latitude, longitude, timestamp);
