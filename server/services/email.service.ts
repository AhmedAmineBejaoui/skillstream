import nodemailer, { type SendMailOptions } from 'nodemailer';

interface TransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

function buildConfig(prefix: string): TransportConfig {
  return {
    host: process.env[`${prefix}_HOST`] || '',
    port: parseInt(process.env[`${prefix}_PORT`] || '587', 10),
    secure: process.env[`${prefix}_SECURE`] === 'true',
    auth: {
      user: process.env[`${prefix}_USER`] || '',
      pass: process.env[`${prefix}_PASS`] || ''
    }
  };
}

const transports = [] as nodemailer.Transporter[];

const primary = buildConfig('SMTP');
transports.push(nodemailer.createTransport(primary));

const fallback = buildConfig('FALLBACK_SMTP');
if (fallback.host) {
  transports.push(nodemailer.createTransport(fallback));
}

export const emailMetrics = {
  attempts: 0,
  successes: 0,
  failures: 0
};

export async function sendEmail(options: SendMailOptions) {
  emailMetrics.attempts++;
  for (const transport of transports) {
    try {
      const info = await transport.sendMail(options);
      emailMetrics.successes++;
      return info;
    } catch (err) {
      emailMetrics.failures++;
      console.error('Email send failed via', (transport as any).options?.host, err);
    }
  }
  throw new Error('All email transports failed');
}
