import fs from 'fs';
import path from 'path';

// AUDIT:Tech Stack -> File Storage in server root

const uploadRoot = path.join(process.cwd(), 'uploads');
const avatarDir = path.join(uploadRoot, 'avatars');

export function initStorage() {
  fs.mkdirSync(avatarDir, { recursive: true });
}

export function getAvatarPath(file: Express.Multer.File) {
  return `/uploads/avatars/${file.filename}`;
}
