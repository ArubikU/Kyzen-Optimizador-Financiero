import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { validateVoucher } from './validators.js';

export const UPLOADS_DIR = path.resolve('uploads');
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png' };

/**
 * Guarda un comprobante recibido como { mimeType, data } (data en base64, con o sin prefijo data:).
 * Devuelve { url } o lanza Error con los mensajes de validación.
 */
export const saveVoucher = ({ mimeType, data }) => {
  const base64 = String(data || '').replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const errors = validateVoucher({ mimeType, sizeBytes: buffer.length });
  if (errors.length) throw new Error(errors.join(' '));
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const fileName = `${randomUUID()}.${EXT[mimeType]}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), buffer);
  return { url: `/uploads/${fileName}` };
};
