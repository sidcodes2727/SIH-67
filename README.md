# HMPI – Heavy Metal Pollution Index Web App

Full-stack HMPI tool for uploading water quality heavy metal data, computing HMPI, visualizing charts and hotspot maps, and exporting results.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, Framer Motion, Recharts, React-Leaflet
- Backend: Node.js, Express.js
- Database: PostgreSQL

## Monorepo Structure
- `backend/` – Express API, HMPI logic, CSV/XLSX parsing, exports
- `frontend/` – React app with dark UI, charts, maps

## Quick Start

1) PostgreSQL
- Ensure Postgres is running and a database named `hmpi` exists (or set `PGDATABASE` in `.env`).

2) Backend setup
```bash
# In backend/
copy .env.example .env   # Windows PowerShell: copy .env.example .env
npm install
npm run db:init
npm run db:seed
npm run dev
```
Backend runs at http://localhost:5000, health at `/api/health`.

3) Frontend setup
```bash
# In frontend/
npm install
npm run dev
```
Frontend (Vite) runs at http://localhost:5173 and proxies `/api` to the backend.

## Environment Variables (`backend/.env`)
- `PORT` – API port, default 5000
- Either `DATABASE_URL` or discrete params `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `PGSSL` – `false` for local

See `backend/.env.example` for a template.

## API Endpoints
- `POST /api/data` – Create a record `{ metal_type, concentration, latitude, longitude, timestamp }`
- `POST /api/data/upload` – Upload CSV/XLSX (field: `file`)
- `GET /api/data` – List all rows
- `GET /api/data/location` – Search by location range: `?latitude=X&longitude=Y&range=Z` (range in km)
- `GET /api/data/:id` – Get row by id
- `GET /api/hmpi/:id` – Compute HMPI for the group (same lat/lng/timestamp as `:id`)
- `GET /api/export/csv?latitude=..&longitude=..&timestamp=..` – Export CSV for a group
- `GET /api/export/pdf?latitude=..&longitude=..&timestamp=..` – Export PDF for a group

## HMPI Calculation
We use the sub-index method in `backend/src/services/hmpiService.js`:
- `Qi = (Mi / Si) * 100`
- `Wi = 1 / Si`
- `HMPI = Σ(Qi * Wi) / Σ(Wi)`
- Limits `Si` (µg/L): Pb=10, Cd=3, As=10, Hg=6, Cr=50
- Categories: Safe (<50), Moderate (50–100), Hazardous (>100)

You can adjust limits and thresholds in `hmpiService.js`.

## Sample Data
A sample CSV is provided at `backend/sample_data/sample.csv`. You can upload this from the Upload page or seed using `npm run db:seed`.

CSV Expected Columns: `latitude, longitude, timestamp, Pb, Cd, As, Hg, Cr`

## Database Schema
The database now uses an optimized schema where each row contains all metal concentrations:
- `latitude` (DOUBLE PRECISION) - Location latitude
- `longitude` (DOUBLE PRECISION) - Location longitude  
- `timestamp` (TIMESTAMP) - Measurement date/time
- `pb` (NUMERIC) - Lead concentration (µg/L)
- `cd` (NUMERIC) - Cadmium concentration (µg/L)
- `as_metal` (NUMERIC) - Arsenic concentration (µg/L)
- `hg` (NUMERIC) - Mercury concentration (µg/L)
- `cr` (NUMERIC) - Chromium concentration (µg/L)
- `hmpi` (NUMERIC) - Calculated Heavy Metal Pollution Index
- `category` (VARCHAR) - Pollution category (Safe/Moderate/Hazardous)

## Frontend Navigation
- Home: hero with quick links
- Upload: form + file upload with validations
- Dashboard: location-based search with time-series mineral concentration charts
- About: method and thresholds

## Exports
- CSV: tabular export of group with computed HMPI/category
- PDF: succinct report with summary and measurements

## Notes
- Animations via Framer Motion; charts via Recharts; maps via React-Leaflet + OpenStreetMap tiles
- Mobile-first, dark theme by default with toggle in navbar

## Scripts
- `backend`: `npm run db:init`, `npm run db:seed`, `npm run hmpi:calculate`, `npm run dev`
- `frontend`: `npm run dev`, `npm run build`, `npm run preview`

## Dashboard Features
- **Location-Based Search**: Enter coordinates and search radius to find nearby mineral measurements
- **Time-Series Charts**: Interactive line graphs showing mineral concentration trends over time
- **Interactive Filters**: Toggle individual minerals on/off in the charts
- **HMPI Integration**: All data includes calculated HMPI values and pollution categories
- **Preset Locations**: Quick-select buttons for major Indian cities

## License
MIT (add your preferred license)
