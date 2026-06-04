import { spawnSync } from "node:child_process";
import path from "node:path";
import { loadEnv, numberEnv } from "../src/lib/env.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
loadEnv(root);

const intervalMinutes = numberEnv("DAEMON_INTERVAL_MINUTES", 45);
const intervalMs = intervalMinutes * 60 * 1000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`Prospection daemon started. Interval: ${intervalMinutes} minutes.`);

while (true) {
  const startedAt = new Date();
  console.log(`\nRun started at ${startedAt.toISOString()}`);
  const result = spawnSync(process.execPath, ["scripts/run-pipeline.mjs"], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    console.error(`Pipeline failed with status ${result.status}. It will retry on next interval.`);
  }
  console.log(`Run finished at ${new Date().toISOString()}`);
  await sleep(intervalMs);
}
