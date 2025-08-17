import mysql from 'mysql2/promise';
import 'dotenv/config';

let pool : any ;

if (process.env.DATABASE_URL) {
  // Connexion via URL complète (Railway, Heroku, etc.)
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Connexion via variables séparées (.env local)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export { pool };
