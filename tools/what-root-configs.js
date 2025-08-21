// tools/what-root-configs.js
const fs = require('fs');

const files = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  '.eslintrc.js',
  '.prettierrc',
  'tailwind.config.js',
  'postcss.config.js',
  'src/env.ts',
];

const found = files.filter((f) => fs.existsSync(f));
const missing = files.filter((f) => !fs.existsSync(f));

console.log('Found:', found);
console.log('Missing:', missing);
