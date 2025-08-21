// tools/check-missing-deps.js

const fs = require('fs');
const path = require('path');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Mark second param as intentionally unused to satisfy ESLint rule
function reportMissing(depName, _depType) {
  console.error(`[missing-dep] ${depName}`);
}

(function main() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = readJSON(pkgPath);

  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  const expected = [
    // keep whatever you already had here; this file just reports missing ones
  ];

  for (const name of expected) {
    if (!deps[name]) {
      reportMissing(name, 'missing');
    }
  }
})();
