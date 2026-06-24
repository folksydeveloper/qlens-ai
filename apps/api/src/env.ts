// Load .env manually at import time, before any module initialization
import * as fs from 'fs';
import * as path from 'path';

// Try multiple possible locations for the .env file
const candidates = [
  path.join(__dirname, '../.env'),           // dist/ → apps/api/.env
  path.join(__dirname, '../../.env'),         // dist/ → apps/api/.env (if nested)
  path.join(process.cwd(), '.env'),           // working dir
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const eq = line.indexOf('=');
        if (eq > 0) {
          const key = line.substring(0, eq).trim();
          let val = line.substring(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
    // Only load from the first file found
    break;
  }
}
