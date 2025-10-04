// HMPI calculation based on sub-index method
// Qi = (Mi/Si)*100, Wi = 1/Si, HMPI = sum(Qi*Wi)/sum(Wi)
// Thresholds: Safe < 50, Moderate 50-100, Hazardous > 100

const LIMITS = {
  pb: 10, // ug/L - Lead
  cd: 3,  // ug/L - Cadmium
  as_metal: 10, // ug/L - Arsenic
  hg: 6,  // ug/L - Mercury
  cr: 50, // ug/L - Chromium
};

export function computeHMPI(row) {
  // row is now a single row with all metal concentrations as columns
  let sumQiWi = 0;
  let sumWi = 0;
  
  // Iterate through each metal in the row
  for (const [metal, limit] of Object.entries(LIMITS)) {
    const concentration = Number(row[metal]) || 0;
    if (concentration > 0) {
      const Qi = (concentration / limit) * 100;
      const Wi = 1 / limit;
      sumQiWi += Qi * Wi;
      sumWi += Wi;
    }
  }
  
  const hmpi = sumWi > 0 ? Number((sumQiWi / sumWi).toFixed(2)) : 0;
  return { hmpi, category: categorize(hmpi) };
}

export function categorize(hmpi) {
  if (hmpi < 50) return 'Safe';
  if (hmpi <= 100) return 'Moderate';
  return 'Hazardous';
}
