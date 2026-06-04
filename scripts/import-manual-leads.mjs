import fs from "node:fs";
import path from "node:path";
import { appendCsv, readCsv } from "../src/lib/csv.mjs";
import { normalizeUrl, stableLeadId } from "../src/lib/url.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "data/inbox/manual-leads.csv");
const leadsPath = path.join(root, "data/leads.csv");
const historyPath = path.join(root, "data/history.json");
const history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
const seen = new Set(history.seenUrls);
const existing = new Set(readCsv(leadsPath).map((lead) => lead.id));
const now = new Date().toISOString();
const imported = [];

for (const row of readCsv(inputPath)) {
  const url = normalizeUrl(row.url);
  if (!url) continue;
  const type = row.type === "institucional" ? "institucional" : "ecommerce";
  const id = stableLeadId(type, url);
  if (existing.has(id) || seen.has(url)) continue;

  imported.push({
    id,
    type,
    name: row.name || new URL(url).hostname.replace(/^www\./, ""),
    url,
    source_query: row.source_query || "manual",
    city: row.city || "",
    niche: row.niche || "",
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
  seen.add(url);
}

appendCsv(leadsPath, imported, [
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

history.seenUrls = [...seen];
fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Imported ${imported.length} manual leads from ${inputPath}`);
