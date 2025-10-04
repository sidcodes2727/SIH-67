import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { query } from '../db.js';

dotenv.config();

const file = process.argv[2];
if (!file) {
  console.error('Usage: node src/utils/run-sql.js <path-to-sql>');
  process.exit(1);
}

const abs = path.resolve(process.cwd(), file);
const sql = fs.readFileSync(abs, 'utf-8');

(async () => {
  try {
    await query(sql);
    console.log('SQL executed:', file);
    process.exit(0);
  } catch (e) {
    console.error('Error executing SQL', e);
    process.exit(1);
  }
})();
