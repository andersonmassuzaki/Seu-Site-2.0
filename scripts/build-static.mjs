import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const dist = path.join(root, "dist");

function run(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

run("scripts/generate-kits.mjs");
run("scripts/export-web.mjs");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const indexHtml = fs
  .readFileSync(path.join(root, "docs/index.html"), "utf8")
  .replaceAll('href="../kits/', 'href="/kits/');
fs.writeFileSync(path.join(dist, "index.html"), indexHtml);
copyDir(path.join(root, "docs/downloads"), path.join(dist, "downloads"));
copyDir(path.join(root, "kits"), path.join(dist, "kits"));

console.log(`Built static site in ${dist}`);
