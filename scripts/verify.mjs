// scripts/verify.mjs
import { spawnSync } from 'node:child_process';

const steps = [
  ['pnpm', ['typecheck']],
  ['pnpm', ['lint']],
  ['pnpm', ['build']],
  ['pnpm', ['format:check']],
];

for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
