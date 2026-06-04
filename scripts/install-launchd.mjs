import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const source = path.join(root, "templates/com.anderson.prospeccao-google.plist");
const targetDir = path.join(os.homedir(), "Library/LaunchAgents");
const target = path.join(targetDir, "com.anderson.prospeccao-google.plist");

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);

console.log(`Installed: ${target}`);
console.log("Next commands:");
console.log(`launchctl load ${target}`);
console.log("launchctl start com.anderson.prospeccao-google");
