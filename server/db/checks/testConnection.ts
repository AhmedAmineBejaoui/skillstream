import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from '../../db.js';

// Fix __dirname and __filename for ESM cross-platform compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connection successful!');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  } finally {
    await pool.end();

  }
}

main();
