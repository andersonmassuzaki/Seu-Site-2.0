import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const config = JSON.parse(fs.readFileSync(path.join(root, "config/segments.json"), "utf8"));

for (const [type, segment] of Object.entries(config)) {
  console.log(`\n# ${segment.label}`);
  for (const niche of segment.niches) {
    for (const location of segment.locations) {
      for (const pattern of segment.queryPatterns) {
        console.log(pattern.replaceAll("{niche}", niche).replaceAll("{location}", location));
      }
    }
  }
}
