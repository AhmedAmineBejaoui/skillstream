import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { initStorage } from '../services/storage.service';

// AUDIT:Tech Stack -> File Storage in server root

initStorage();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});

export const uploadAvatar = multer({ storage });
