// tools/setup-deps.js
// Usage:
//   node tools/setup-deps.js        -> just checks, prints install commands
//   node tools/setup-deps.js --auto -> checks and installs whatever is missing (with Tailwind v3 pins)

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VERSION_PINS = {
  tailwindcss: '3.4.17',
  postcss: '8.4.47',
  autoprefixer: '10.4.20',
};

const RUNTIME = ['zod', 'firebase', 'firebase-admin'];
const DEV = [
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'prettier',
  'prettier-plugin-tailwindcss',
  'eslint',
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  'eslint-config-next',
  'eslint-config-prettier',
  'eslint-plugin-import',
  'eslint-plugin-tailwindcss',
];

const ROOT = process.cwd();
const pkgPath = path.join(ROOT, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('❌ No package.json found in current directory.');
  process.exit(1);
}
const pkg = require(pkgPath);

const hasPnpm = fs.existsSync(path.join(ROOT, 'pnpm-lock.yaml'));
const hasYarn = fs.existsSync(path.join(ROOT, 'yarn.lock'));
const pm = hasPnpm ? 'pnpm' : hasYarn ? 'yarn' : 'npm';

const isInstalled = (name) =>
  Boolean(
    (pkg.dependencies && pkg.dependencies[name]) ||
      (pkg.devDependencies && pkg.devDependencies[name]),
  );

const missingRuntime = RUNTIME.filter((d) => !isInstalled(d));
const missingDev = DEV.filter((d) => !isInstalled(d));

console.log('=== Dependency Check ===');
console.log('\nRuntime deps (required):');
RUNTIME.forEach((d) => console.log(`${isInstalled(d) ? '✅' : '❌'} ${d}`));
console.log('\nDev deps (required for lint/format/build):');
DEV.forEach((d) => console.log(`${isInstalled(d) ? '✅' : '❌'} ${d}`));

const auto = process.argv.includes('--auto');

// If tailwindcss is installed but it's v4, we will treat it as missing to repin.
// Read lock-less by checking node_modules if present.
function getInstalledVersion(name) {
  try {
    const p = require.resolve(`${name}/package.json`, { paths: [ROOT] });
    return require(p).version || null;
  } catch {
    return null;
  }
}
const tailwindVer = getInstalledVersion('tailwindcss');
const needsTailwindV3 =
  !tailwindVer || /^4\./.test(tailwindVer) || pkg.devDependencies?.tailwindcss === 'latest';

if (!missingDev.includes('tailwindcss') && needsTailwindV3) {
  // force reinstall to v3 if v4 detected
  missingDev.push('tailwindcss');
}

if (!missingRuntime.length && !missingDev.length) {
  console.log('\n🎉 All required packages are installed.');
  process.exit(0);
}

if (!auto) {
  if (missingRuntime.length) {
    const cmd =
      pm === 'pnpm'
        ? `pnpm add ${missingRuntime.join(' ')}`
        : pm === 'yarn'
          ? `yarn add ${missingRuntime.join(' ')}`
          : `npm install ${missingRuntime.join(' ')}`;
    console.log(`\n❌ Missing runtime deps: ${missingRuntime.join(', ')}`);
    console.log('Install with:');
    console.log(cmd);
  }
  if (missingDev.length) {
    // Apply pins for tailwind/postcss/autoprefixer
    const withPins = missingDev.map((d) => (VERSION_PINS[d] ? `${d}@${VERSION_PINS[d]}` : d));
    const cmd =
      pm === 'pnpm'
        ? `pnpm add -D ${withPins.join(' ')}`
        : pm === 'yarn'
          ? `yarn add -D ${withPins.join(' ')}`
          : `npm install -D ${withPins.join(' ')}`;
    console.log(`\n❌ Missing dev deps: ${missingDev.join(', ')}`);
    console.log('Install with:');
    console.log(cmd);
    console.log('\n(We pin Tailwind to v3 to satisfy eslint-plugin-tailwindcss@3.x peer deps.)');
  }
  process.exit(1);
}

function run(cmd, args) {
  console.log(`\n▶ ${[cmd, ...args].join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) {
    console.error(`\n❌ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

// Clean any Tailwind v4 packages that may create conflicts
function uninstall(names) {
  if (pm === 'pnpm') run('pnpm', ['remove', ...names]);
  else if (pm === 'yarn') run('yarn', ['remove', ...names]);
  else run('npm', ['uninstall', ...names]);
}

// If we detected v4 artifacts, drop them before installing
const hasV4Artifacts =
  getInstalledVersion('@tailwindcss/postcss') ||
  getInstalledVersion('@tailwindcss/node') ||
  (tailwindVer && /^4\./.test(tailwindVer));

if (hasV4Artifacts) {
  uninstall(['tailwindcss', '@tailwindcss/postcss', '@tailwindcss/node'].filter(Boolean));
}

if (missingRuntime.length) {
  if (pm === 'pnpm') run('pnpm', ['add', ...missingRuntime]);
  else if (pm === 'yarn') run('yarn', ['add', ...missingRuntime]);
  else run('npm', ['install', ...missingRuntime]);
}

if (missingDev.length) {
  const withPins = missingDev.map((d) => (VERSION_PINS[d] ? `${d}@${VERSION_PINS[d]}` : d));
  if (pm === 'pnpm') run('pnpm', ['add', '-D', ...withPins]);
  else if (pm === 'yarn') run('yarn', ['add', '-D', ...withPins]);
  else run('npm', ['install', '-D', ...withPins]);
}

console.log('\n✅ Done. Re-run to confirm all green:');
console.log('   node tools/setup-deps.js');
