import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

// AUDIT:System Overview -> Assessment and certification system

export const certificatesService = {
  async createCertificate(userId: number, courseId: number) {
    const certificateNumber = `CERT-${Date.now()}`;
    const verificationCode = uuidv4();
    const [result] = await pool.query<any>(
      `INSERT INTO certificates (user_id, course_id, certificate_number, issued_date, certificate_url, verification_code, is_valid)
       VALUES (?,?,?,?,?,?,1)`,
      [userId, courseId, certificateNumber, new Date(), '', verificationCode]
    );
    return result.insertId as number;
  },

  async verifyCertificate(id: string) {
    const [rows] = await pool.query<any[]>(`SELECT id FROM certificates WHERE certificate_number = ? AND is_valid = 1`, [id]);
    return rows.length > 0;
  }
};
