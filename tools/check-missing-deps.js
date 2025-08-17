const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(process.cwd(), "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error("❌ No package.json found in current directory.");
  process.exit(1);
}

const pkg = require(pkgPath);

const allDeps = {
  runtime: ["zod", "firebase", "firebase-admin"],
  dev: [
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "prettier",
    "prettier-plugin-tailwindcss",
    "eslint",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "eslint-config-next",
    "eslint-config-prettier",
    "eslint-plugin-import",
    "eslint-plugin-tailwindcss"
  ]
};

function checkDeps(depList, depType) {
  return depList.filter((name) => {
    const inDeps = pkg.dependencies?.[name];
    const inDev = pkg.devDependencies?.[name];
    return !(inDeps || inDev);
  });
}

const missingRuntime = checkDeps(allDeps.runtime, "runtime");
const missingDev = checkDeps(allDeps.dev, "dev");

console.log("=== Dependency Check ===");

console.log("\n✅ Installed runtime deps:");
allDeps.runtime.forEach((d) => {
  if (!missingRuntime.includes(d)) console.log("  -", d);
});

console.log("\n✅ Installed dev deps:");
allDeps.dev.forEach((d) => {
  if (!missingDev.includes(d)) console.log("  -", d);
});

if (missingRuntime.length) {
  console.log("\n❌ Missing runtime deps:", missingRuntime.join(", "));
  console.log("Install with:");
  console.log(`npm install ${missingRuntime.join(" ")}`);
}

if (missingDev.length) {
  console.log("\n❌ Missing dev deps:", missingDev.join(", "));
  console.log("Install with:");
  console.log(`npm install -D ${missingDev.join(" ")}`);
}

if (!missingRuntime.length && !missingDev.length) {
  console.log("\n🎉 All required packages are installed!");
}
