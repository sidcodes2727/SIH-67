import { query } from '../db.js';
import { computeHMPI } from '../services/hmpiService.js';

async function calculateHMPIForAllRows() {
  try {
    console.log('🔄 Calculating HMPI for all rows...');
    
    // Get all rows from the new schema
    const rowsResult = await query(`
      SELECT id, latitude, longitude, timestamp, pb, cd, as_metal, hg, cr 
      FROM heavy_metal_data 
      ORDER BY timestamp, latitude, longitude
    `);
    
    console.log(`Found ${rowsResult.rows.length} rows`);
    
    let updated = 0;
    
    for (const row of rowsResult.rows) {
      // Calculate HMPI for this individual row
      const { hmpi, category } = computeHMPI(row);
      
      // Update this row with the calculated HMPI
      const updateResult = await query(
        `UPDATE heavy_metal_data 
         SET hmpi=$1, category=$2 
         WHERE id=$3`,
        [hmpi, category, row.id]
      );
      
      console.log(`✅ Row ${row.id} [${row.latitude}, ${row.longitude}] at ${row.timestamp}: HMPI=${hmpi}, Category=${category}`);
      updated += updateResult.rowCount;
    }
    
    console.log(`🎉 Successfully updated ${updated} rows with HMPI calculations`);
    
    // Verify the results
    const verifyResult = await query(`
      SELECT COUNT(*) as total, 
             COUNT(hmpi) as with_hmpi,
             array_agg(DISTINCT category) as categories,
             AVG(hmpi) as avg_hmpi
      FROM heavy_metal_data
    `);
    
    console.log('📊 Verification:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Error calculating HMPI:', error);
    throw error;
  }
}

// Run the calculation
calculateHMPIForAllRows()
  .then(() => {
    console.log('✅ HMPI calculation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to calculate HMPI:', error);
    process.exit(1);
  });