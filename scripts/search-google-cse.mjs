import fs from "node:fs";
import path from "node:path";
import { loadEnv, numberEnv } from "../src/lib/env.mjs";
import { appendCsv } from "../src/lib/csv.mjs";
import { normalizeUrl, stableLeadId } from "../src/lib/url.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
loadEnv(root);

const apiKey = process.env.GOOGLE_API_KEY;
const cseId = process.env.GOOGLE_CSE_ID;
if (!apiKey || !cseId) {
  console.error("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID. Copy .env.example to .env and configure it.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(path.join(root, "config/segments.json"), "utf8"));
const historyPath = path.join(root, "data/history.json");
const history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
const maxResults = numberEnv("MAX_RESULTS_PER_QUERY", 10);
const now = new Date().toISOString();
const leads = [];

async function search(query) {
  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    num: String(Math.min(maxResults, 10))
  });
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
  if (!response.ok) throw new Error(`Google CSE ${response.status}: ${await response.text()}`);
  return response.json();
}

for (const [type, segment] of Object.entries(config)) {
  for (const niche of segment.niches) {
    for (const location of segment.locations) {
      const pattern = segment.queryPatterns[Math.floor(Math.random() * segment.queryPatterns.length)];
      const query = pattern.replaceAll("{niche}", niche).replaceAll("{location}", location);
      console.log(`Searching: ${query}`);
      const result = await search(query);
      for (const item of result.items ?? []) {
        const url = normalizeUrl(item.link);
        if (!url || history.seenUrls.includes(url)) continue;
        history.seenUrls.push(url);
        leads.push({
          id: stableLeadId(type, url),
          type,
          name: item.title?.replace(/\s+-\s+.*$/, "") ?? item.displayLink,
          url,
          source_query: query,
          city: location,
          niche,
          status: "novo",
          score: "",
          priority: "",
          main_problem: "",
          email: "",
          phone: "",
          whatsapp: "",
          instagram: "",
          next_action: "auditar site",
          next_follow_up_at: "",
          created_at: now,
          updated_at: now
        });
      }
    }
  }
}

appendCsv(path.join(root, "data/leads.csv"), leads, [
  "id",
  "type",
  "name",
  "url",
  "source_query",
  "city",
  "niche",
  "status",
  "score",
  "priority",
  "main_problem",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "next_action",
  "next_follow_up_at",
  "created_at",
  "updated_at"
]);
fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Added ${leads.length} new leads.`);
