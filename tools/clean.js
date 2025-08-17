// tools/clean.js
/* Clean build artifacts on any OS (PowerShell/cmd/bash safe) */
const fs = require('fs');
const paths = ['.next', 'dist'];

for (const p of paths) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`✓ removed ${p}`);
  } catch (err) {
    console.warn(`! could not remove ${p}:`, err?.message || err);
  }
}
