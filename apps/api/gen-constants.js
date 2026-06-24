const fs = require('fs');
const envPath = './.env';
const env = fs.readFileSync(envPath, 'utf8');
const lines = env.split('\n').filter(l => l.startsWith('JWT_') && l.includes('='));
const out = lines.map(l => {
  const eq = l.indexOf('=');
  const key = l.substring(0, eq).trim();
  let val = l.substring(eq + 1).trim();
  // Strip quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return `export const ${key} = ${JSON.stringify(val)};`;
}).join('\n');
fs.writeFileSync('./src/auth/jwt.constants.ts', out + '\n');
console.log('Written constants:');
console.log(out);
