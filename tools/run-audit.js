// tools/run-audit.js
// Cross-platform audit runner that writes timestamped reports to reports/audit/

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    "-" +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  );
}

const REPORT_DIR = path.resolve(process.cwd(), "reports", "audit");
fs.mkdirSync(REPORT_DIR, { recursive: true });

function run(cmd, args, outfile) {
  return new Promise((resolve) => {
    const stamp = ts();
    const outPath = path.join(REPORT_DIR, `${outfile}-${stamp}.txt`);
    const child = spawn(cmd, args, { shell: true });

    let buf = "";
    child.stdout.on("data", (d) => (buf += d.toString()));
    child.stderr.on("data", (d) => (buf += d.toString()));

    child.on("close", (code) => {
      try {
        fs.writeFileSync(outPath, buf, "utf8");
      } catch (e) {
        console.error("Failed to write report:", outPath, e);
      }
      const status = code === 0 ? "OK" : `EXIT ${code}`;
      console.log(`• ${cmd} ${args.join(" ")} -> ${path.relative(process.cwd(), outPath)} [${status}]`);
      resolve(code);
    });
  });
}

async function main() {
  const which = (process.argv[2] || "all").toLowerCase();

  const tasks = {
    knip: () => run("knip", [], "knip"),
    depcheck: () => run("depcheck", [], "depcheck"),
    madge: () => run("madge", ["--circular", "src"], "madge-circular"),
    unused: () =>
      run(
        "eslint",
        ["src", "--ext", ".js,.jsx,.ts,.tsx", "--rule", "unused-imports/no-unused-imports: error"],
        "eslint-unused-imports"
      ),
  };

  if (which === "all") {
    const codes = [];
    for (const name of Object.keys(tasks)) {
      // eslint-disable-next-line no-await-in-loop
      codes.push(await tasks[name]());
    }
    const fail = codes.some((c) => c !== 0);
    process.exit(fail ? 1 : 0);
  } else if (which in tasks) {
    const code = await tasks[which]();
    process.exit(code);
  } else {
    console.error("Unknown audit target. Use one of: all, knip, depcheck, madge, unused");
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
