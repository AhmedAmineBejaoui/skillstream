// AUDIT:Database Schema -> automated evidence generation
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import expectedSchema from './expectedSchema.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const snapshotsDir = path.resolve(__dirname, 'snapshots');

interface ColumnRow {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_DEFAULT: any;
  EXTRA: string;
}

interface ConstraintData {
  primaryKeys: string[];
  uniqueKeys: Array<{ name: string; columns: string[] }>;
  foreignKeys: Array<{ name: string; columns: string[]; referencedTable: string; referencedColumns: string[]; deleteRule?: string }>;
}

interface TableReport {
  status: 'OK' | 'PARTIEL' | 'NON';
  differences: string[];
  evidence?: { create: { path: string; lines: number }; columns: string; constraints: string };
  error?: string;
}

function normType(t: string) {
  return t.toLowerCase().replace('boolean', 'tinyint(1)');
}

function compareSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const as = [...a].sort().join(',');
  const bs = [...b].sort().join(',');
  return as === bs;
}

async function fetchConstraints(conn: mysql.Connection, db: string, table: string): Promise<ConstraintData> {
  const [rows] = await conn.query<any>(
    `SELECT tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.DELETE_RULE
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
     JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA AND tc.TABLE_NAME = kcu.TABLE_NAME
     LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME AND tc.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
     WHERE tc.TABLE_SCHEMA = ? AND tc.TABLE_NAME = ?
     ORDER BY tc.CONSTRAINT_NAME, kcu.ORDINAL_POSITION`,
    [db, table]
  );

  const data: ConstraintData = { primaryKeys: [], uniqueKeys: [], foreignKeys: [] };
  const grouped: Record<string, any[]> = {};
  for (const r of rows) {
    if (!grouped[r.CONSTRAINT_NAME]) grouped[r.CONSTRAINT_NAME] = [];
    grouped[r.CONSTRAINT_NAME].push(r);
  }
  for (const [name, group] of Object.entries(grouped)) {
    const type = group[0].CONSTRAINT_TYPE as string;
    const cols = group.map(g => g.COLUMN_NAME);
    if (type === 'PRIMARY KEY') {
      data.primaryKeys.push(...cols);
    } else if (type === 'UNIQUE') {
      data.uniqueKeys.push({ name, columns: cols });
    } else if (type === 'FOREIGN KEY') {
      data.foreignKeys.push({ name, columns: cols, referencedTable: group[0].REFERENCED_TABLE_NAME, referencedColumns: group.map(g => g.REFERENCED_COLUMN_NAME), deleteRule: group[0].DELETE_RULE });
    }
  }
  return data;
}

async function checkTable(conn: mysql.Connection, db: string, table: string, spec: any): Promise<TableReport> {
  const [existsRows] = await conn.query<any>(
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [db, table]
  );
  if (existsRows.length === 0) {
    return { status: 'NON', differences: ['table not found'] };
  }

  const [colsRows] = await conn.query<ColumnRow[]>(
    `SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION`,
    [db, table]
  );
  const constraints = await fetchConstraints(conn, db, table);
  const [createRows] = await conn.query<any>(`SHOW CREATE TABLE \`${table}\``);
  const createSQL: string = createRows[0]['Create Table'];

  await fs.mkdir(snapshotsDir, { recursive: true });
  const createPath = path.join(snapshotsDir, `${table}.create.sql`);
  await fs.writeFile(createPath, createSQL + '\n');
  const columnsPath = path.join(snapshotsDir, `${table}.columns.json`);
  await fs.writeFile(columnsPath, JSON.stringify(colsRows, null, 2));
  const constraintsPath = path.join(snapshotsDir, `${table}.constraints.json`);
  await fs.writeFile(constraintsPath, JSON.stringify(constraints, null, 2));
  const createLines = createSQL.split('\n').length;

  const diffs: string[] = [];
  const colMap: Record<string, ColumnRow> = {};
  for (const c of colsRows) colMap[c.COLUMN_NAME] = c;

  for (const [colName, colSpec] of Object.entries(spec.columns)) {
    const actual = colMap[colName];
    if (!actual) {
      diffs.push(`missing column ${colName}`);
      continue;
    }
    if (normType(actual.COLUMN_TYPE) !== normType(colSpec.type)) {
      diffs.push(`type mismatch on ${colName}`);
    }
    const nullable = actual.IS_NULLABLE === 'YES';
    if (nullable !== colSpec.nullable) {
      diffs.push(`nullability mismatch on ${colName}`);
    }
    const actualDef = actual.COLUMN_DEFAULT === null ? null : String(actual.COLUMN_DEFAULT).toUpperCase();
    const expectedDef = colSpec.default ? colSpec.default.toUpperCase() : null;
    if (actualDef !== expectedDef) {
      diffs.push(`default mismatch on ${colName}`);
    }
    const actualOnUpd = actual.EXTRA.toUpperCase().includes('ON UPDATE') ? 'CURRENT_TIMESTAMP' : null;
    const expectedOnUpd = colSpec.onUpdate ? colSpec.onUpdate.toUpperCase() : null;
    if (actualOnUpd !== expectedOnUpd) {
      if (expectedOnUpd || actualOnUpd) diffs.push(`onUpdate mismatch on ${colName}`);
    }
    if (colSpec.pk) {
      if (!constraints.primaryKeys.includes(colName)) diffs.push(`primary key missing on ${colName}`);
    }
    if (colSpec.unique) {
      const hasUnique = constraints.uniqueKeys.some(u => u.columns.length === 1 && u.columns[0] === colName);
      if (!hasUnique) diffs.push(`unique constraint missing on ${colName}`);
    }
    if (colSpec.fk) {
      const fkFound = constraints.foreignKeys.some(fk => fk.columns.length === 1 && fk.columns[0] === colName && fk.referencedTable === colSpec.fk.table && fk.referencedColumns[0] === colSpec.fk.column && (!colSpec.fk.onDelete || fk.deleteRule === colSpec.fk.onDelete));
      if (!fkFound) diffs.push(`foreign key mismatch on ${colName}`);
    }
  }

  if (spec.constraints?.unique) {
    for (const u of spec.constraints.unique) {
      const found = constraints.uniqueKeys.some(act => compareSets(act.columns, u.columns));
      if (!found) diffs.push(`missing unique constraint on (${u.columns.join(',')})`);
    }
  }

  const status: TableReport['status'] = diffs.length === 0 ? 'OK' : 'PARTIEL';
  return { status, differences: diffs, evidence: { create: { path: createPath, lines: createLines }, columns: columnsPath, constraints: constraintsPath } };
}

async function main() {
  const tablesOrder = [
    'users','user_profiles','categories','instructors','courses','course_pricing','chapters','lessons','exercises',
    'quizzes','user_course_progress','user_lesson_progress','quiz_attempts','exams','exam_resources','exam_submissions','exam_submission_files',
    'cart_items','orders','order_items','coupons','coupon_usage',
    'blog_posts','testimonials','newsletter_subscribers','course_reviews',
    'certificates','notifications','email_logs'
  ];
  const reports: Record<string, TableReport> = {};
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const db = process.env.DB_NAME as string;
    // AUDIT:Database Schema -> users
    reports['users'] = await checkTable(conn, db, 'users', (expectedSchema as any)['users']);
    // AUDIT:Database Schema -> user_profiles
    reports['user_profiles'] = await checkTable(conn, db, 'user_profiles', (expectedSchema as any)['user_profiles']);
    // AUDIT:Database Schema -> categories
    reports['categories'] = await checkTable(conn, db, 'categories', (expectedSchema as any)['categories']);
    // AUDIT:Database Schema -> instructors
    reports['instructors'] = await checkTable(conn, db, 'instructors', (expectedSchema as any)['instructors']);
    // AUDIT:Database Schema -> courses
    reports['courses'] = await checkTable(conn, db, 'courses', (expectedSchema as any)['courses']);
    // AUDIT:Database Schema -> course_pricing
    reports['course_pricing'] = await checkTable(conn, db, 'course_pricing', (expectedSchema as any)['course_pricing']);
    // AUDIT:Database Schema -> chapters
    reports['chapters'] = await checkTable(conn, db, 'chapters', (expectedSchema as any)['chapters']);
    // AUDIT:Database Schema -> lessons
    reports['lessons'] = await checkTable(conn, db, 'lessons', (expectedSchema as any)['lessons']);
    // AUDIT:Database Schema -> exercises
    reports['exercises'] = await checkTable(conn, db, 'exercises', (expectedSchema as any)['exercises']);
    // AUDIT:Database Schema -> quizzes
    reports['quizzes'] = await checkTable(conn, db, 'quizzes', (expectedSchema as any)['quizzes']);
    // AUDIT:Database Schema -> user_course_progress
    reports['user_course_progress'] = await checkTable(conn, db, 'user_course_progress', (expectedSchema as any)['user_course_progress']);
    // AUDIT:Database Schema -> user_lesson_progress
    reports['user_lesson_progress'] = await checkTable(conn, db, 'user_lesson_progress', (expectedSchema as any)['user_lesson_progress']);
    // AUDIT:Database Schema -> quiz_attempts
    reports['quiz_attempts'] = await checkTable(conn, db, 'quiz_attempts', (expectedSchema as any)['quiz_attempts']);
    // AUDIT:Database Schema -> exams
    reports['exams'] = await checkTable(conn, db, 'exams', (expectedSchema as any)['exams']);
    // AUDIT:Database Schema -> exam_resources
    reports['exam_resources'] = await checkTable(conn, db, 'exam_resources', (expectedSchema as any)['exam_resources']);
    // AUDIT:Database Schema -> exam_submissions
    reports['exam_submissions'] = await checkTable(conn, db, 'exam_submissions', (expectedSchema as any)['exam_submissions']);
    // AUDIT:Database Schema -> exam_submission_files
    reports['exam_submission_files'] = await checkTable(conn, db, 'exam_submission_files', (expectedSchema as any)['exam_submission_files']);
    // AUDIT:Database Schema -> cart_items
    reports['cart_items'] = await checkTable(conn, db, 'cart_items', (expectedSchema as any)['cart_items']);
    // AUDIT:Database Schema -> orders
    reports['orders'] = await checkTable(conn, db, 'orders', (expectedSchema as any)['orders']);
    // AUDIT:Database Schema -> order_items
    reports['order_items'] = await checkTable(conn, db, 'order_items', (expectedSchema as any)['order_items']);
    // AUDIT:Database Schema -> coupons
    reports['coupons'] = await checkTable(conn, db, 'coupons', (expectedSchema as any)['coupons']);
    // AUDIT:Database Schema -> coupon_usage
    reports['coupon_usage'] = await checkTable(conn, db, 'coupon_usage', (expectedSchema as any)['coupon_usage']);
    // AUDIT:Database Schema -> blog_posts
    reports['blog_posts'] = await checkTable(conn, db, 'blog_posts', (expectedSchema as any)['blog_posts']);
    // AUDIT:Database Schema -> testimonials
    reports['testimonials'] = await checkTable(conn, db, 'testimonials', (expectedSchema as any)['testimonials']);
    // AUDIT:Database Schema -> newsletter_subscribers
    reports['newsletter_subscribers'] = await checkTable(conn, db, 'newsletter_subscribers', (expectedSchema as any)['newsletter_subscribers']);
    // AUDIT:Database Schema -> course_reviews
    reports['course_reviews'] = await checkTable(conn, db, 'course_reviews', (expectedSchema as any)['course_reviews']);
    // AUDIT:Database Schema -> certificates
    reports['certificates'] = await checkTable(conn, db, 'certificates', (expectedSchema as any)['certificates']);
    // AUDIT:Database Schema -> notifications
    reports['notifications'] = await checkTable(conn, db, 'notifications', (expectedSchema as any)['notifications']);
    // AUDIT:Database Schema -> email_logs
    reports['email_logs'] = await checkTable(conn, db, 'email_logs', (expectedSchema as any)['email_logs']);
    await conn.end();
  } catch (err: any) {
    console.error('DB connection failed', err);
    for (const table of tablesOrder) {
      const msg = `erreur connexion DB: ${err.message || err.code || err}`;
      reports[table] = { status: 'NON', differences: [], error: msg };
    }
  }

  const summary = { OK: 0, PARTIEL: 0, NON: 0 } as Record<string, number>;
  for (const r of Object.values(reports)) {
    summary[r.status]++;
  }
  const jsonPath = path.resolve(__dirname, 'schema_report.json');
  await fs.writeFile(jsonPath, JSON.stringify({ tables: reports, summary }, null, 2));

  const mdPath = path.resolve(__dirname, 'schema_report.md');
  const lines: string[] = ['# Database Schema Check — Evidence',''];
  const sections: Record<string, string[]> = {
    '## 3.1 User Management Tables': ['users','user_profiles'],
    '## 3.2 Course Management Tables': ['categories','instructors','courses','course_pricing','chapters','lessons','exercises'],
    '## 3.3 Assessment & Progress Tables': ['quizzes','user_course_progress','user_lesson_progress','quiz_attempts','exams','exam_resources','exam_submissions','exam_submission_files'],
    '## 3.4 E-commerce Tables': ['cart_items','orders','order_items','coupons','coupon_usage'],
    '## 3.5 Content Management Tables': ['blog_posts','testimonials','newsletter_subscribers','course_reviews'],
    '## 3.6 Certificates and Notifications': ['certificates','notifications','email_logs']
  };

  for (const [section, tbls] of Object.entries(sections)) {
    lines.push(section, '');
    for (const t of tbls) {
      const rep = reports[t];
      lines.push(`${t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g,' ')} table`);
      lines.push('EXIGENCE : "Schéma conforme au cahier de charges"');
      lines.push(`STATUT : ${rep.status}`);
      if (rep.error) {
        lines.push('PREUVES :');
        lines.push(`- Artefacts : ${rep.error}`);
      } else if (rep.evidence) {
        lines.push('PREUVES :');
        lines.push(`- Fichiers/Lignes : ${path.relative(path.resolve(""), rep.evidence.create.path)} (L1-L${rep.evidence.create.lines})`);
        lines.push(`- Artefacts : ${path.relative(path.resolve(""), rep.evidence.columns)} ; ${path.relative(path.resolve(""), rep.evidence.constraints)}`);
      }
      lines.push('');
    }
  }
  lines.push('Récapitulatif','');
  lines.push(`OK : ${summary.OK}`);
  lines.push(`PARTIEL : ${summary.PARTIEL}`);
  lines.push(`NON : ${summary.NON}`);
  await fs.writeFile(mdPath, lines.join('\n'));
  console.log('Summary:', summary);
}

main();
