import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'arcade-secret-key-2026-neon-matrix',
  databaseUrl: process.env.DATABASE_URL || '',
  qrSecret: process.env.QR_SECRET || 'dynamic-qr-salt-arcade-2026',
  qrValidDurationSec: 60, // Total valid window
  qrRefreshDurationSec: 30, // UI refresh interval
};
