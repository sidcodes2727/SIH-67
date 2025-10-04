// HMPI calculation based on sub-index method
// Qi = (Mi/Si)*100, Wi = 1/Si, HMPI = sum(Qi*Wi)/sum(Wi)
// Thresholds: Safe < 50, Moderate 50-100, Hazardous > 100

const LIMITS = {
  Pb: 10, // ug/L
  Cd: 3,
  As: 10,
  Hg: 6,
  Cr: 50,
};

export function computeHMPI(rows) {
  let sumQiWi = 0;
  let sumWi = 0;
  for (const r of rows) {
    const S = LIMITS[r.metal_type];
    if (!S) continue;
    const Mi = Number(r.concentration);
    const Qi = (Mi / S) * 100;
    const Wi = 1 / S;
    sumQiWi += Qi * Wi;
    sumWi += Wi;
  }
  const hmpi = sumWi > 0 ? Number((sumQiWi / sumWi).toFixed(2)) : 0;
  return { hmpi, category: categorize(hmpi) };
}

export function categorize(hmpi) {
  if (hmpi < 50) return 'Safe';
  if (hmpi <= 100) return 'Moderate';
  return 'Hazardous';
}
