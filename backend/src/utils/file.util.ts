import * as fs from 'fs';
import * as path from 'path';

export function ensureUploadDir(dir: string) {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}
