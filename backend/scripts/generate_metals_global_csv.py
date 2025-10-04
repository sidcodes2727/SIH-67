# save as generate_metals_global_csv.py and run: python generate_metals_global_csv.py
import csv, random, datetime, pathlib
from math import cos, radians

# ---------- Settings ----------
ROWS = 1000
OUT_PATH = r"c:\Users\SIDDHANT SALUNKE\OneDrive\Desktop\SIH 67\data\metals_global.csv"
DELIMITER = ","
METAL_MAP = {
    "Lead": "Pb",
    "Mercury": "Hg",
    "Cadmium": "Cd",
    "Arsenic": "As",
    "Chromium": "Cr",
    "Nickel": "Ni",
    "Copper": "Cu",
    "Zinc": "Zn",
}
CONC_MIN, CONC_MAX = 0.01, 500.0
LAT_MIN, LAT_MAX = -90.0, 90.0
LON_MIN, LON_MAX = -180.0, 180.0
DATE_START = datetime.datetime(2023, 1, 1)
DATE_END = datetime.datetime.now()
SEED = 42
LAT_BANDS, LON_BANDS = 18, 36  # 648 cells
# --------------------------------

if SEED is not None:
    random.seed(SEED)

path = pathlib.Path(OUT_PATH)
path.parent.mkdir(parents=True, exist_ok=True)
metals = list(METAL_MAP.keys())

def rand_timestamp():
    t = random.randint(int(DATE_START.timestamp()), int(DATE_END.timestamp()))
    return datetime.datetime.fromtimestamp(t).isoformat(timespec="seconds")

def cell_bounds(i_lat, i_lon):
    lat_step = (LAT_MAX - LAT_MIN) / LAT_BANDS
    lon_step = (LON_MAX - LON_MIN) / LON_BANDS
    lat0 = LAT_MIN + i_lat * lat_step
    lon0 = LON_MIN + i_lon * lon_step
    return lat0, lat0 + lat_step, lon0, lon0 + lon_step

def rand_in_cell(lat0, lat1, lon0, lon1):
    return random.uniform(lat0, lat1), random.uniform(lon0, lon1)

def rand_point_weighted_by_area():
    while True:
        lat = random.uniform(LAT_MIN, LAT_MAX)
        if random.random() <= abs(cos(radians(lat))):
            break
    lon = random.uniform(LON_MIN, LON_MAX)
    return lat, lon

rows = []

# Ensure coverage: one per cell
for i_lat in range(LAT_BANDS):
    for i_lon in range(LON_BANDS):
        lat0, lat1, lon0, lon1 = cell_bounds(i_lat, i_lon)
        lat, lon = rand_in_cell(lat0, lat1, lon0, lon1)
        metal = random.choice(metals)
        rows.append((
            METAL_MAP[metal],
            f"{random.uniform(CONC_MIN, CONC_MAX):.2f}",
            f"{lat:.6f}",
            f"{lon:.6f}",
            rand_timestamp()
        ))

# Fill remaining
while len(rows) < ROWS:
    lat, lon = rand_point_weighted_by_area()
    metal = random.choice(metals)
    rows.append((
        METAL_MAP[metal],
        f"{random.uniform(CONC_MIN, CONC_MAX):.2f}",
        f"{lat:.6f}",
        f"{lon:.6f}",
        rand_timestamp()
    ))

random.shuffle(rows)

with open(path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, delimiter=DELIMITER)
    w.writerow(["metal_symbol", "concentration", "latitude", "longitude", "timestamp"])
    w.writerows(rows)

print(f"Wrote {len(rows)} rows to {path}")