import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import 'dotenv/config';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = mysql.createPool(process.env.DATABASE_URL);
// Cast to any to allow using existing Postgres-oriented schema
export const db: any = drizzle(pool as any, { schema: schema as any });
export { pool };
