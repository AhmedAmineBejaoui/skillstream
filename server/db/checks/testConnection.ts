import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const { pool } = await import(path.resolve(__dirname, '../../db.js'));
    const conn = await pool.getConnection();
    console.log('✅ Database connection successful!');
    conn.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

main();
