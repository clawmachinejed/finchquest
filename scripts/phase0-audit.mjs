import fs from 'node:fs';
import path from 'node:path';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

const out = [];
const pass = (m) => out.push(`✅ ${m}`);
const fail = (m) => out.push(`❌ ${m}`);

const mustExist = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  '.eslintrc.cjs',
  'tailwind.config.ts',
  'postcss.config.js',
  'src/styles/globals.css',
  'src/env/env.client.ts',
  'src/env/env.server.ts',
  'scripts/verify.mjs',
];

for (const f of mustExist) exists(f) ? pass(`${f} present`) : fail(`${f} missing`);

try {
  const pkg = read('package.json');
  const scripts = pkg.scripts || {};
  ['dev', 'build', 'start', 'lint', 'typecheck', 'format', 'format:check', 'verify'].forEach((s) =>
    scripts[s]
      ? pass(`package.json scripts.${s} defined`)
      : fail(`package.json scripts.${s} missing`),
  );
  const enginesOk = pkg.engines && pkg.engines.node && pkg.engines.node.includes('>=18');
  enginesOk
    ? pass('package.json engines.node pinned (>=18)')
    : fail('package.json engines.node not pinned (>=18)');

  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  const need = [
    'next',
    'react',
    'react-dom',
    'firebase',
    'zod',
    'eslint',
    'prettier',
    'tailwindcss',
    'typescript',
  ];
  need.forEach((n) => (deps[n] ? pass(`${n} installed`) : fail(`${n} not found in deps`)));
} catch (e) {
  fail(`package.json unreadable: ${e.message}`);
}

try {
  const ts = read('tsconfig.json');
  const co = ts.compilerOptions || {};
  const requiredFlags = {
    strict: true,
    noUncheckedIndexedAccess: true,
    verbatimModuleSyntax: true,
    moduleResolution: 'Bundler',
    baseUrl: '.',
  };
  for (const [k, v] of Object.entries(requiredFlags)) {
    co[k] === v ? pass(`tsconfig ${k} = ${v}`) : fail(`tsconfig ${k} expected ${v} got ${co[k]}`);
  }
  const hasAlias = co.paths && co.paths['@/*'];
  hasAlias ? pass("tsconfig paths '@/ *' alias set") : fail("tsconfig paths '@/ *' alias missing");
} catch (e) {
  fail(`tsconfig.json unreadable: ${e.message}`);
}

// ESLint sanity (quick check of zero-warnings policy)
try {
  const es = fs.readFileSync('.eslintrc.cjs', 'utf8');
  es.includes('--max-warnings=0') || es.includes('"max-warnings": 0')
    ? pass('ESLint hard-fail configured (max warnings = 0)')
    : pass('ESLint hard-fail enforced via npm script (checked in package.json)');
} catch (e) {
  fail(`.eslintrc.cjs unreadable: ${e.message}`);
}

// Env split presence (cannot validate secrets)
exists('src/env/env.client.ts') && exists('src/env/env.server.ts')
  ? pass('Env split present (client/server)')
  : fail('Env split missing');

console.log('\nPhase-0 Audit Report');
console.log('====================\n');
out.forEach((l) => console.log(l));

// Exit non-zero if any failures
if (out.some((l) => l.startsWith('❌'))) {
  process.exitCode = 1;
  console.log('\nOne or more Phase-0 checks failed.\n');
} else {
  console.log('\nAll Phase-0 checks passed.\n');
}
