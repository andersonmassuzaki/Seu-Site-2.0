import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const steps = [
  ["search", "scripts/search-google-cse.mjs"],
  ["enrich", "scripts/enrich-sites.mjs"],
  ["score", "scripts/score-leads.mjs"],
  ["outbox", "scripts/generate-outbox.mjs"],
  ["capture", "scripts/capture-site.mjs"],
  ["kit", "scripts/generate-kits.mjs"],
  ["video", "scripts/generate-video.mjs"]
];

for (const [label, script] of steps) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
